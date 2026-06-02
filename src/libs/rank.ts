import EVENT_CONFIG from '@event/config';

export function normalizeRank(rank?: string) {
  if (!rank) {
    return undefined;
  }

  const normalized = rank.toLowerCase();

  if (EVENT_CONFIG?.unknownRanks?.includes(normalized)) {
    return undefined;
  }

  return normalized;
}

export function getRankValue(rank?: string) {
  if (!rank) {
    return 0;
  }

  const val = parseInt(rank, 10);
  const level = rank[rank.length - 1].toLowerCase();

  switch (level) {
    case 'p':
      return val * 10000;
    case 'd':
      return val * 100;
    case 'k':
    default:
      return 100 - val;
  }
}
