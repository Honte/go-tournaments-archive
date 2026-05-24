import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { SgfRootProps } from '@/schema/sgf';
import type { SgfNode } from '@tools/sgf';
import { Sgf } from '@tools/sgf';
import { normalizeSgfResult } from './result';
import type { SgfInfo } from './types';

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
  const {
    blackName: filenameBlackName,
    whiteName: filenameWhiteName,
    round: filenameRound,
    stage: filenameStage,
  } = parseFilename(filename);

  let sgf: Sgf;
  try {
    sgf = new Sgf(content);
  } catch {
    return {
      path: filename,
      sgfBlackName: null,
      sgfWhiteName: null,
      sgfRound: null,
      filenameBlackName,
      filenameWhiteName,
      filenameStage,
      filenameRound,
      rawResult: null,
      cleanResult: null,
      resultIssue: null,
      contentIssue: null,
      corrupted: true,
    };
  }

  const sgfBlackName = sgf.getStringRootProperty(SgfRootProps.BLACK_NAME) ?? null;
  const sgfWhiteName = sgf.getStringRootProperty(SgfRootProps.WHITE_NAME) ?? null;
  const rawResult = sgf.getStringRootProperty(SgfRootProps.GAME_RESULT) ?? null;
  const sgfRound = parseRoundValue(sgf.getStringRootProperty(SgfRootProps.GAME_ROUND));

  const { cleanResult, resultIssue } = normalizeSgfResult(rawResult);

  const output: SgfInfo = {
    path: filename,
    sgfBlackName,
    sgfWhiteName,
    sgfRound,
    filenameBlackName,
    filenameWhiteName,
    filenameRound,
    filenameStage,
    rawResult,
    cleanResult,
    resultIssue,
    contentIssue: null,
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

// Parse filename hints such as player names, stage token, and the filename numeric prefix/index.
// Multi-part names should use underscores (e.g. "Kim-Sung-Lee" → "Kim_Sung_Lee").
export function parseFilename(filename: string): {
  blackName: string | null;
  whiteName: string | null;
  round: number | null;
  stage: string | null;
} {
  const stem = path.parse(filename).name;
  const tokens = stem.split('-').filter(Boolean);

  if (tokens[0]?.match(/^\d{4}$/)) {
    tokens.shift();
  }

  let stage: string | null = null;
  let round: number | null = null;
  let nameTokens = [...tokens];
  const stageTokenIndex = tokens.findIndex((token) => isStageToken(token));

  if (stageTokenIndex >= 0) {
    stage = normalizeStageToken(tokens[stageTokenIndex]);

    if (tokens[stageTokenIndex + 1]?.match(/^\d+$/)) {
      round = Number(tokens[stageTokenIndex + 1]);
    }

    if (stageTokenIndex === 0) {
      if (round !== null) {
        nameTokens = tokens.slice(stageTokenIndex + 2);
      } else {
        nameTokens = tokens.slice(stageTokenIndex + 1);
      }
    } else {
      nameTokens = tokens.slice(0, stageTokenIndex);
    }
  } else if (tokens[0]?.match(/^\d+$/)) {
    round = Number(tokens[0]);
    nameTokens = tokens.slice(1);
  }

  const namePart = nameTokens.join('-');
  const nameSeparator = namePart.lastIndexOf('-');

  if (nameSeparator > 0) {
    return {
      blackName: namePart.slice(0, nameSeparator),
      whiteName: namePart.slice(nameSeparator + 1),
      round,
      stage,
    };
  }

  return {
    blackName: null,
    whiteName: null,
    round,
    stage,
  };
}

function isStageToken(token: string): boolean {
  return ['league', 'final', 'ladder', 'playoff', 'playoffs', 'roundrobin'].includes(token.toLowerCase());
}

function normalizeStageToken(token: string): string {
  const normalized = token.toLowerCase();

  if (normalized === 'playoff' || normalized === 'playoffs') {
    return 'playoffs';
  }

  if (normalized === 'roundrobin') {
    return 'round-robin-table';
  }

  return normalized;
}
