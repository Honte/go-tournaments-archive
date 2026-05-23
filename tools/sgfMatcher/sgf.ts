import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { SgfRootProps } from '@/schema/sgf';
import type { SgfNode } from '@tools/sgf';
import { Sgf } from '@tools/sgf';
import { normalizeSgfResult } from './result';
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

export async function loadSgfInfos(rootDir: string, sgfPaths: string[], isStrict = false) {
  return Promise.all(sgfPaths.map((p) => loadSgfInfo(rootDir, p, isStrict)));
}

export function hasSgfFilenameSpaces(filename: string): boolean {
  return /\s/.test(path.parse(filename).base);
}

async function loadSgfInfo(rootDir: string, sgfPath: string, isStrict = false) {
  const content = await readFile(path.join(rootDir, sgfPath), 'utf-8');

  return extractSgfInfo(content, sgfPath, isStrict);
}

export function extractSgfInfo(content: string, filename: string, isStrict = false): SgfInfo {
  const { names: fromFilename, round: roundFromFilename } = parseFilename(filename);

  let sgf: Sgf;
  try {
    sgf = new Sgf(content);
  } catch {
    return {
      path: filename,
      metadata: { blackName: null, whiteName: null },
      fromFilename,
      rawResult: null,
      cleanResult: null,
      resultIssue: null,
      contentIssue: null,
      round: roundFromFilename,
      corrupted: true,
    };
  }

  const metadata: PlayerNames = {
    blackName: sgf.getStringRootProperty(SgfRootProps.BLACK_NAME) ?? null,
    whiteName: sgf.getStringRootProperty(SgfRootProps.WHITE_NAME) ?? null,
  };
  const rawResult = sgf.getStringRootProperty(SgfRootProps.GAME_RESULT) ?? null;
  const roundFromMetadata = parseRoundValue(sgf.getStringRootProperty(SgfRootProps.GAME_ROUND));

  const { cleanResult, resultIssue } = normalizeSgfResult(rawResult);

  const output: SgfInfo = {
    path: filename,
    metadata,
    fromFilename,
    rawResult,
    cleanResult,
    resultIssue,
    contentIssue: null,
    round: roundFromMetadata ?? roundFromFilename,
    corrupted: false,
  };

  let longestBranch: SgfNode[];
  try {
    longestBranch = sgf.getLongestBranch();
  } catch {
    output.contentIssue = 'multiple longest branches';
    return output;
  }

  if (isStrict) {
    const mainBranch = sgf.getMainBranch();

    if (longestBranch.length !== mainBranch.length || longestBranch.at(-1)?.id !== mainBranch.at(-1)?.id) {
      output.contentIssue = 'longest branch is not main branch';
      return output;
    }
  }

  return output;
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
