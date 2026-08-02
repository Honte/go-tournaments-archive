const PROPERTY_REGEX = /(?<key>[A-Z]+)\[(?<value>.*)]/;
const GAME_REGEX = /(?<opponent>\d+)(?<result>[+=-])(?<modifier>!)?(\/(?<color>[wb])(?<handicap>\d)?)?/;
const FIRST_GAME_COLUMN = 6; // after place, surname, name, rank, country, club

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

export type H9Player = {
  place: number;
  name: string;
  surname: string;
  rank?: string;
  country: string;
  club: string;
  games: (null | H9Game)[];
  scores: string[];
  egd?: number;
};

export type H9Game = {
  opponent: number;
  round: number;
  modifier?: '!';
  result: '+' | '-' | '=';
  color?: 'white' | 'black';
  handicap?: number;
};

export function buildLocalGameId(p1: number, p2: number, round?: number): string {
  const [low, high] = p1 < p2 ? [p1, p2] : [p2, p1];

  if (round === undefined) {
    return `${low}-${high}`;
  }

  return `${low}-${high}-${round}`;
}

export function loadH9(input: string) {
  const properties: Record<string, string> = {};
  const other: string[] = [];
  const table = [];

  for (const line of input.split(/\r?\n/)) {
    if (!line.trim().length) {
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
      table.push(line.trim().split(/\s+|\t+/));
    }
  }

  return { properties, other, table };
}

export function parseH9(input: string): H9Tournament {
  const { properties, other, table } = loadH9(input);
  const results: H9Player[] = [];
  const colsWithGames = getColumnsWithGames(table);
  const colsRounds = Array.from(colsWithGames).sort((a, b) => a - b);

  for (const player of table) {
    const [place, surname, name, rank, country, club, ...columns] = player;
    const games: H9Player['games'] = [];
    const scores: string[] = [];
    const egd = columns[columns.length - 1].startsWith('|') ? Number(columns.pop()!.slice(1)) : undefined;

    for (let col = 0; col < columns.length; col++) {
      const value = columns[col];

      if (!colsWithGames.has(col)) {
        scores.push(value);
        continue;
      }

      games.push(parseH9Game(value, colsRounds.indexOf(col) + 1));
    }

    results.push({
      place: Number(place),
      name: name.replace(/_/g, ' '),
      surname: surname.replace(/_/g, ' '),
      rank: normalizeRank(rank),
      country,
      club,
      games,
      scores,
      egd,
    });
  }

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
    results,
    other,
  };
}

function getColumnsWithGames(table: string[][]) {
  const results: Record<string, number> = {};

  for (const player of table) {
    for (let col = FIRST_GAME_COLUMN; col < player.length; col++) {
      const index = col - FIRST_GAME_COLUMN;
      const value = player[col];

      results[index] ||= 0;

      if (!value || value === '-' || value === '?' || value?.match(GAME_REGEX)) {
        results[index]++;
      }
    }
  }

  // round is only when all values are expected (is a game or is a game skip)
  return new Set(
    Object.keys(results)
      .filter((index) => results[index] === table.length)
      .map(Number)
  );
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

function normalizeRank(rank?: string) {
  if (!rank) {
    return rank;
  }

  if (rank.match(/^\d\d$/)) {
    return `${rank}k`;
  }

  return rank.toLowerCase();
}
