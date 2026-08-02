import { isDrawResult, JIGO } from '@/libs/games';

type NormalizedSgfResult = {
  cleanResult: string | null;
  resultIssue: string | null;
};

export function normalizeSgfResult(rawResult: string | null): NormalizedSgfResult {
  if (rawResult === null) {
    return { cleanResult: null, resultIssue: null };
  }

  const value = rawResult.trim();

  if (value === '?' || value.toLowerCase() === 'void') {
    return { cleanResult: null, resultIssue: null };
  }

  if (isDrawResult(value)) {
    return { cleanResult: JIGO, resultIssue: null };
  }

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
    return { cleanResult: `${color}+?`, resultIssue: null };
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

  if (result.toLowerCase() === 'time') {
    return 'T';
  }

  if (/^\d+([,.]\d+)?$/.test(result)) {
    const score = Number(result.replace(',', '.'));

    return score === 0 ? '?' : String(score);
  }

  return result;
}
