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
  const { names: fromFilename, round: roundFromFilename } = parseFilename(filename);

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
      round: roundFromFilename,
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
  const roundFromMetadata = parseRoundValue(data?.RO?.[0]);

  return {
    path: filename,
    metadata,
    fromFilename,
    rawResult,
    cleanResult,
    round: roundFromMetadata ?? roundFromFilename,
    corrupted: false,
  };
}

function parseRoundValue(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\d+/);

  return match ? Number(match[0]) : null;
}

// Parse a SGF filename like "2018/5-YiTienChan-ChenWang.sgf" into its round prefix and player names.
// - leading "{N}-" is treated as the round number
// - remaining digits are stripped before splitting on the last dash into black/white
// - multi-part names should use underscores (e.g. "Kim-Sung-Lee" → "Kim_Sung_Lee")
export function parseFilename(filename: string): { names: PlayerNames; round: number | null } {
  const stem = path.parse(filename).name;
  const roundMatch = stem.match(/^(\d+)-/);
  const round = roundMatch ? Number(roundMatch[1]) : null;
  const cleaned = stem.replace(/\d/g, '').replace(/^-+/, '').replace(/-+$/, '');
  const nameSeparator = cleaned.lastIndexOf('-');

  if (nameSeparator > 0) {
    return {
      names: {
        blackName: cleaned.slice(0, nameSeparator),
        whiteName: cleaned.slice(nameSeparator + 1),
      },
      round,
    };
  }

  return { names: { blackName: null, whiteName: null }, round };
}
