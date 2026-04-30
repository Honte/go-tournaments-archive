import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sgfParser from '@sabaki/sgf';
import fg from 'fast-glob';
import type { PlayerNames, SgfInfo } from './types';

type NormalizedSgfResult = {
  cleanResult: string | null;
  resultIssue: string | null;
};

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
      resultIssue: null,
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
  const { cleanResult, resultIssue } = normalizeSgfResult(rawResult);
  const roundFromMetadata = parseRoundValue(data?.RO?.[0]);

  return {
    path: filename,
    metadata,
    fromFilename,
    rawResult,
    cleanResult,
    resultIssue,
    round: roundFromMetadata ?? roundFromFilename,
    corrupted: false,
  };
}

export function normalizeSgfResult(rawResult: string | null): NormalizedSgfResult {
  if (rawResult === null) {
    return { cleanResult: null, resultIssue: null };
  }

  const value = rawResult.trim();

  if (!value) {
    return {
      cleanResult: null,
      resultIssue: `invalid result "${rawResult}": expected B+<result> or W+<result>`,
    };
  }

  const colorMatch = value.match(/^([A-Za-z]+)(.*)$/);

  if (!colorMatch) {
    return {
      cleanResult: null,
      resultIssue: `invalid result "${rawResult}": expected B+<result> or W+<result>`,
    };
  }

  const [, rawColor, rest] = colorMatch;
  const color = normalizeResultColor(rawColor);

  if (!color) {
    return {
      cleanResult: null,
      resultIssue: `invalid result color "${rawColor}": expected B, W, Black, or White`,
    };
  }

  if (!rest) {
    return { cleanResult: color, resultIssue: null };
  }

  if (!rest.startsWith('+') && !rest.startsWith(',')) {
    return {
      cleanResult: null,
      resultIssue: `invalid result "${rawResult}": expected + or , separator`,
    };
  }

  const result = rest.slice(1);

  if (!result) {
    return {
      cleanResult: null,
      resultIssue: `invalid result "${rawResult}": expected B+<result> or W+<result>`,
    };
  }

  if (/\s/.test(result)) {
    return {
      cleanResult: null,
      resultIssue: `invalid result "${rawResult}": result must not contain spaces`,
    };
  }

  return { cleanResult: `${color}+${normalizeResultValue(result)}`, resultIssue: null };
}

function normalizeResultColor(color: string): 'B' | 'W' | null {
  const normalized = color.toLowerCase();

  if (normalized === 'b' || normalized === 'black') {
    return 'B';
  }

  if (normalized === 'w' || normalized === 'white') {
    return 'W';
  }

  return null;
}

function normalizeResultValue(result: string): string {
  if (result.toLowerCase() === 'resign') {
    return 'R';
  }

  if (/^\d+([,.]\d+)?$/.test(result)) {
    return String(Number(result.replace(',', '.')));
  }

  return result;
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
