export function getRankValue(rank) {
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
