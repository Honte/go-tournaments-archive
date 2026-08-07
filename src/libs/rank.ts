export function getRankValue(rank?: string) {
  if (!rank) {
    return 0;
  }

  const val = parseInt(rank, 10);

  if (isNaN(val)) {
    return 0;
  }

  const level = rank[rank.length - 1].toLowerCase();

  switch (level) {
    case 'p':
      return 108 + val;
    case 'd':
      return 99 + val; // 1-9 dan, 10d equals to 1p
    case 'k':
      return 100 - val;
    default:
      return 0;
  }
}
