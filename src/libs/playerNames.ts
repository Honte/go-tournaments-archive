export function splitPlayerName(name: string): { firstName: string; lastName: string } {
  const [first = '', ...rest] = name.trim().split(/\s+/);

  return rest.length ? { firstName: first, lastName: rest.join(' ') } : { firstName: '', lastName: first };
}
