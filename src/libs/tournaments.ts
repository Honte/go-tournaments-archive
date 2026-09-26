import type { Player, Stage, Tournament } from '@/schema/data';
import { formatDate, formatRange } from '@/libs/dates';

export type TournamentRow = {
  year: number;
  location?: string;
  country?: string;
  start?: string;
  end?: string;
  dates?: string;
  gold: Player[];
  silver: Player[];
  bronze: Player[];
  referee?: string;
  players: number;
  stages: number;
  games: number;
  sgfs: number;
};

export type TournamentSortKey = Exclude<keyof TournamentRow, 'start' | 'end'> | 'dates';
export type PodiumKey = 'gold' | 'silver' | 'bronze';

export function buildTournamentRows(
  tournaments: readonly Tournament[],
  category?: string,
  locale = 'en'
): TournamentRow[] {
  const rows: TournamentRow[] = [];

  for (const tournament of tournaments) {
    const row = buildTournamentRow(tournament, category, locale);
    if (row) {
      rows.push(row);
    }
  }

  return rows;
}

export function sortTournamentRows(
  rows: readonly TournamentRow[],
  key: TournamentSortKey,
  descending: boolean,
  locale: string,
  countryLabel: (code: string) => string
): TournamentRow[] {
  const collator = new Intl.Collator(locale);
  const direction = descending ? -1 : 1;

  return rows.toSorted((a, b) => {
    const diff = compareRowValues(a, b, key, collator, direction, countryLabel);
    return diff || b.year - a.year;
  });
}

export function sortPodium(players: readonly Player[], locale: string, descending = false): Player[] {
  const collator = new Intl.Collator(locale);
  return players.toSorted((a, b) => comparePlayers(a, b, collator) * (descending ? -1 : 1));
}

function buildTournamentRow(tournament: Tournament, category?: string, locale = 'en'): TournamentRow | undefined {
  if (tournament.announcement) {
    return undefined;
  }

  const top = (category ? tournament.categoriesTop?.[category] : tournament.top) ?? [];
  const stagePlayers: Set<string>[] = [];
  let stages = 0;

  for (const stage of tournament.stages) {
    const members = getStagePlayers(stage, category);
    stagePlayers.push(members);
    if (!category || stage.category === category || members.size > 0) {
      stages++;
    }
  }

  if (category && !stages && !tournament.categoriesTop?.[category]) {
    return undefined;
  }

  let games = 0;
  let sgfs = 0;

  for (const game of Object.values(tournament.games)) {
    if (game.players.some(isBye)) {
      continue;
    }
    if (category && !game.players.some((player) => stagePlayers[game.stage]?.has(player.id))) {
      continue;
    }
    if (!game.unresolved) {
      games++;
    }
    if (game.props.sgf) {
      sgfs++;
    }
  }

  return {
    year: tournament.year,
    location: tournament.location || undefined,
    country: tournament.country || undefined,
    start: tournament.start,
    end: tournament.end,
    dates: formatTournamentDates(tournament, locale),
    gold: getPodium(tournament, top[0]),
    silver: getPodium(tournament, top[1]),
    bronze: getPodium(tournament, top[2]),
    referee: tournament.referee,
    players: countPlayers(tournament, category, stagePlayers, top),
    stages,
    games,
    sgfs,
  };
}

function countPlayers(
  tournament: Tournament,
  category?: string,
  stagePlayers?: readonly Set<string>[],
  top?: readonly (readonly string[])[]
): number {
  const ids = new Set<string>();

  const addPlayer = (id: string) => {
    if (id !== 'BYE') {
      const player = tournament.players[id];
      if (player && player.id !== 'BYE') {
        ids.add(player.id);
      }
    }
  };

  if (stagePlayers && stagePlayers.length > 0) {
    for (const members of stagePlayers) {
      for (const id of members) {
        addPlayer(id);
      }
    }
  } else if (!category) {
    for (const player of Object.values(tournament.players)) {
      if (player.id !== 'BYE') {
        ids.add(player.id);
      }
    }
  }

  if (category && top) {
    for (const place of top) {
      for (const id of place) {
        addPlayer(id);
      }
    }
  }

  return ids.size;
}

function getStagePlayers(stage: Stage, category?: string): Set<string> {
  const players = new Set<string>();

  for (const player of stage.table) {
    if (
      !category ||
      stage.category === category ||
      ('categories' in player && player.categories?.[category] !== undefined)
    ) {
      players.add(player.id);
    }
  }

  return players;
}

function getPodium(tournament: Tournament, ids?: readonly string[]): Player[] {
  if (!ids) {
    return [];
  }
  const players: Player[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const player = tournament.players[id];
    if (player && !seen.has(player.id)) {
      seen.add(player.id);
      players.push(player);
    }
  }
  return players;
}

function isBye(player: { id: string }): boolean {
  return player.id === 'BYE';
}

function formatTournamentDates(tournament: Tournament, locale: string): string | undefined {
  if (tournament.start && tournament.end) {
    return formatRange(tournament.start, tournament.end, locale);
  }
  const date = tournament.start ?? tournament.end;
  return date ? formatDate(date, locale) : undefined;
}

function comparePlayers(a: Player, b: Player, collator: Intl.Collator): number {
  return (
    collator.compare(getSurname(a.name), getSurname(b.name)) ||
    collator.compare(a.name, b.name) ||
    a.id.localeCompare(b.id)
  );
}

function getSurname(name: string): string {
  return name.trim().split(/\s+/).slice(1).join(' ') || name;
}

function isRowValueMissing(row: TournamentRow, key: TournamentSortKey): boolean {
  if (key === 'dates') {
    return !row.start && !row.end;
  }
  if (key === 'gold' || key === 'silver' || key === 'bronze') {
    return row[key].length === 0;
  }
  return row[key] === undefined || row[key] === '';
}

function compareRowValues(
  a: TournamentRow,
  b: TournamentRow,
  key: TournamentSortKey,
  collator: Intl.Collator,
  direction: number,
  countryLabel: (code: string) => string
): number {
  const aMissing = isRowValueMissing(a, key);
  const bMissing = isRowValueMissing(b, key);
  if (aMissing !== bMissing) {
    return aMissing ? 1 : -1;
  }
  if (aMissing && bMissing) {
    return 0;
  }

  if (key === 'gold' || key === 'silver' || key === 'bronze') {
    return comparePodiums(a[key], b[key], collator, direction);
  }

  if (key === 'dates') {
    const startDiff = Date.parse(a.start ?? a.end!) - Date.parse(b.start ?? b.end!);
    const endDiff = Date.parse(a.end ?? a.start!) - Date.parse(b.end ?? b.start!);
    return (startDiff || endDiff) * direction;
  }

  if (key === 'country') {
    return collator.compare(countryLabel(a.country!), countryLabel(b.country!)) * direction;
  }

  if (key === 'location' || key === 'referee') {
    return collator.compare(a[key]!, b[key]!) * direction;
  }

  return (a[key] - b[key]) * direction;
}

function comparePodiums(a: Player[], b: Player[], collator: Intl.Collator, direction: number): number {
  const sortedA = a.toSorted((p1, p2) => comparePlayers(p1, p2, collator) * direction);
  const sortedB = b.toSorted((p1, p2) => comparePlayers(p1, p2, collator) * direction);
  const length = Math.min(sortedA.length, sortedB.length);

  for (let i = 0; i < length; i++) {
    const diff = comparePlayers(sortedA[i], sortedB[i], collator) * direction;
    if (diff) {
      return diff;
    }
  }

  return (sortedA.length - sortedB.length) * direction;
}
