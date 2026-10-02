const PROPERTY_REGEX = /(?<key>[A-Z]+)\[(?<value>.*)]/;
const GAME_REGEX = /(?<opponent>\d+)(?<result>[?+=-])(?<modifier>!)?(\/(?<color>[wb])(?<handicap>\d)?)?/;

export type H9Tournament = {
  id: string;
  class: 'A' | 'B' | 'C' | 'D';
  name: string;
  country?: string;
  location?: string;
  dates: string[];
  handicap: number;
  komi: number;
  time: number;
  comments?: string;
  other?: string[];
  results: H9Player[];
};

export type H9Player = H9Member & {
  line?: number;
  members?: [H9Member, H9Member];
  place: number;
  club: string;
  games: (null | H9Game)[];
  scores: string[];
};

export type H9Member = {
  name: string;
  surname: string;
  rank?: string;
  country?: string;
  egd?: number;
};

export type H9Game = {
  opponent: number;
  round: number;
  modifier?: '!';
  result: '+' | '-' | '=' | '?';
  color?: 'white' | 'black';
  handicap?: number;
};

type H9Row = {
  player: Omit<H9Player, 'games' | 'scores'>;
  columns: string[];
};

export function parseH9(input: string): H9Tournament {
  const { properties, other, rows: sourceRows } = loadH9(input);
  const rows: H9Row[] = [];

  for (const { columns, line } of sourceRows) {
    rows.push(PAIR_RANK.test(columns[6] ?? '') ? parsePairRow(columns, line) : parsePlayerRow(columns));
  }

  const gameColumns = getColumnsWithGames(rows);

  return {
    id: properties.TC,
    name: properties.EV,
    ...parseLocation(properties.PC),
    class: properties.CL as H9Tournament['class'],
    dates: properties.DT ? properties.DT.split(',').map((date) => date.trim()) : [],
    handicap: properties.HA ? parseInt(properties.HA.slice(1), 10) : 0,
    komi: parseFloat(properties.KM),
    time: parseInt(properties.TM, 10),
    comments: properties.CM,
    results: rows.map((row) => parseRowResults(row, gameColumns)),
    other,
  };
}

export function loadH9(input: string) {
  const properties: Record<string, string> = {};
  const other: string[] = [];
  const rows: { columns: string[]; line: number }[] = [];

  for (const [lineIndex, line] of input.split(/\r?\n/).entries()) {
    if (!line.trim().length || line.trimStart().startsWith('#')) {
      continue;
    }

    if (line.startsWith(';')) {
      const match = PROPERTY_REGEX.exec(line);

      if (match) {
        const { key, value } = match.groups!;

        properties[key] = value;
      } else if (line.trim() !== ';' && line.trim() !== ';.') {
        other.push(line.replace(/^;\s+/, '').trim());
      }
    } else {
      rows.push({
        columns: line.trim().split(/\s+|\t+/),
        line: lineIndex + 1,
      });
    }
  }

  return { properties, other, rows };
}

export function buildLocalGameId(p1: number, p2: number, round?: number): string {
  const [low, high] = p1 < p2 ? [p1, p2] : [p2, p1];

  if (round === undefined) {
    return `${low}-${high}`;
  }

  return `${low}-${high}-${round}`;
}

export function normalizePlayerName(value: string) {
  return value.replace(/_/g, ' ');
}

export function normalizeRank(rank?: string | null) {
  if (!rank) {
    return undefined;
  }

  if (rank.match(/^\d\d$/)) {
    return `${rank}k`;
  }

  return rank.toLowerCase();
}

export function normalizeCountryCode(country?: string) {
  return country?.toUpperCase();
}

function parsePlayerRow(row: string[]): H9Row {
  const [place, surname, name, rank, country, club, ...columns] = row;
  const pin = columns.at(-1)?.startsWith('|') ? columns.pop() : undefined;

  return {
    player: {
      place: Number(place),
      name: normalizePlayerName(name),
      surname: normalizePlayerName(surname),
      rank: normalizeRank(rank),
      country: normalizeCountryCode(country) ?? 'XX',
      club,
      egd: pin === undefined ? undefined : Number(pin.slice(1)),
    },
    columns,
  };
}

function parseRowResults({ player, columns }: H9Row, gameColumns: Set<number>): H9Player {
  const games: H9Player['games'] = [];
  const scores: string[] = [];

  for (const [column, value] of columns.entries()) {
    if (gameColumns.has(column)) {
      games.push(parseH9Game(value, games.length + 1));
    } else {
      scores.push(value);
    }
  }

  return { ...player, games, scores };
}

function getColumnsWithGames(rows: H9Row[]): Set<number> {
  const counts = new Map<number, number>();

  for (const { columns } of rows) {
    for (const [column, value] of columns.entries()) {
      if (!value || value === '-' || value === '?' || GAME_REGEX.test(value)) {
        counts.set(column, (counts.get(column) ?? 0) + 1);
      }
    }
  }

  const gameColumns = new Set<number>();
  for (const [column, count] of counts) {
    // A round must contain a game or an empty-round marker in every row.
    if (count === rows.length) {
      gameColumns.add(column);
    }
  }

  return gameColumns;
}

function parseH9Game(value: string, round: number): H9Game | null {
  const match = GAME_REGEX.exec(value);

  if (value === '?' || !match || (match.groups?.opponent === '0' && match.groups.result === '=')) {
    return null;
  }

  const { opponent, result, color, handicap, modifier } = match.groups!;

  return {
    round,
    color: color ? (color === 'w' ? 'white' : 'black') : undefined,
    handicap: handicap ? parseInt(handicap, 10) : undefined,
    opponent: Number(opponent),
    modifier: modifier as H9Game['modifier'],
    result: result as H9Game['result'],
  };
}

function parseLocation(location?: string) {
  const index = location ? location.indexOf(',') : -1;

  return {
    country: index >= 0 ? location!.slice(0, index).trim() : undefined,
    location: index >= 0 ? location!.slice(index + 1).trim() : location?.trim(),
  };
}

const PAIR_RANK = /^\d{1,2}[dkp]$/i;
const PAIR_COUNTRY = /^(?:[a-z]{2}){1,2}$/i;

function parsePairRow(row: string[], line: number): H9Row {
  try {
    const text = row.join(' ');
    const pins = text.match(/\|(\d+)\|(\d+)$/);
    if (!pins && text.includes('|')) {
      throw new Error('Expected two EGD identifiers');
    }

    const values = text
      .slice(0, pins?.index ?? text.length)
      .trimEnd()
      .split(/\s+/);
    const [rank, country, ...columns] = values.slice(7);
    // H9 exports may include a club between the country and scores/rounds.
    const club = columns[0] && /^[\p{L}_][\p{L}\p{N}_-]*$/u.test(columns[0]) ? columns.shift()! : '';

    if (!PAIR_RANK.test(rank ?? '') || !PAIR_COUNTRY.test(country ?? '') || columns.some(isInvalidPairResult)) {
      throw new Error('Invalid pair columns; pair rank and country are required');
    }

    const parsed = parsePlayerRow([
      values[0],
      'Pair',
      'Pair',
      rank,
      country.slice(0, 2).toUpperCase() === country.slice(-2).toUpperCase() ? country.slice(0, 2) : 'XX',
      club,
      ...columns,
    ]);

    parsed.player.line = line;
    parsed.player.members = [
      parsePairMember(values.slice(1, 4), country.slice(0, 2), pins?.[1]),
      parsePairMember(values.slice(4, 7), country.slice(-2), pins?.[2]),
    ];

    return parsed;
  } catch (cause) {
    throw new Error(`H9 line ${line}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
  }
}

function parsePairMember(values: string[], country: string, pin?: string): H9Member {
  const [surname, name, rank] = values;

  if (!surname || !name || !PAIR_RANK.test(rank ?? '')) {
    throw new Error('Invalid pair member; name and rank are required');
  }

  return {
    surname: normalizePlayerName(surname),
    name: normalizePlayerName(name),
    rank: normalizeRank(rank),
    country: normalizeCountryCode(country),
    egd: pin === undefined ? undefined : Number(pin),
  };
}

function isInvalidPairResult(value: string): boolean {
  return !/^(?:[-?]|\d.*)$/.test(value);
}
