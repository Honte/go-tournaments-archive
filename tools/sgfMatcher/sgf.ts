import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sgfParser from '@sabaki/sgf';
import fg from 'fast-glob';
import type { PlayerNames, SgfInfo } from './types';

export function resolveNames(sgf: SgfInfo): PlayerNames {
  return {
    blackName: sgf.metadata.blackName ?? sgf.fromFilename.blackName,
    whiteName: sgf.metadata.whiteName ?? sgf.fromFilename.whiteName,
  };
}

export async function findSgfs(rootDir: string, lookupDir: string) {
  const pattern = `${rootDir}/${lookupDir}/*.sgf`.replaceAll(path.sep, '/');
  const paths = await fg.glob(pattern);

  return paths.map((p) => path.posix.relative(rootDir, p));
}

export async function loadSgfInfos(rootDir: string, sgfPaths: string[]) {
  return Promise.all(sgfPaths.map((p) => loadSgfInfo(rootDir, p)));
}

async function loadSgfInfo(rootDir: string, sgfPath: string) {
  const content = await readFile(path.join(rootDir, sgfPath), 'utf-8');

  return extractSgfInfo(content, sgfPath);
}

function extractSgfInfo(content: string, filename: string): SgfInfo {
  const fromFilename = extractNamesFromFilename(filename);

  let nodes;
  try {
    nodes = sgfParser.parse(content);
  } catch {
    return {
      path: filename,
      metadata: { blackName: null, whiteName: null },
      fromFilename,
      rawResult: null,
      cleanResult: null,
      corrupted: true,
    };
  }

  const data = nodes[0]?.data;
  const metadata: PlayerNames = {
    blackName: data?.PB?.[0] ?? null,
    whiteName: data?.PW?.[0] ?? null,
  };
  const rawResult = data?.RE?.[0] ?? null;
  // Some SGFs in the archive use "B,Resign" instead of "B+Resign" as the result separator — accept both.
  const cleanResult = rawResult ? rawResult.replace(/,/g, '+') : null;

  return {
    path: filename,
    metadata,
    fromFilename,
    rawResult,
    cleanResult,
    corrupted: false,
  };
}

// Split the name by dash
// - if the file name contain rounds separated with dash (1-name1-name2, or name1-name2-1) the round would be ignore
// - note that multi part names should used underscore instead of dash (e.g. "Kim-Sung-Lee" → "Kim_Sung_Lee")
function extractNamesFromFilename(filename: string): PlayerNames {
  const stem = path.parse(filename).name;
  const cleaned = stem.replace(/\d/g, '').replace(/^-+/, '').replace(/-+$/, '');
  const nameSeparator = cleaned.lastIndexOf('-');

  if (nameSeparator > 0) {
    return {
      blackName: cleaned.slice(0, nameSeparator),
      whiteName: cleaned.slice(nameSeparator + 1),
    };
  }

  return { blackName: null, whiteName: null };
}
