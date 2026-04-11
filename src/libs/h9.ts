const PROPERTY_REGEX = /(?<key>[A-Z]+)\[(?<value>.*)]/;
const GAME_REGEX = /(?<opponent>\d+)(?<result>[+=-])(?<modifier>!)?(\/(?<color>[wb])(?<handicap>\d)?)?/;

export type H9Tournament = {
  id: string;
  class: 'A' | 'B' | 'C' | 'D';
  name: string;
  country: string;
  location: string;
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
  rank: string;
  country: string;
  club: string;
  games: (null | H9Game)[];
  scores: string[];
  egd?: number;
};

export type H9Game = {
  opponent: number;
  modifier?: '!';
  result: '+' | '-' | '=';
  color?: 'white' | 'black';
  handicap?: number;
};

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

  for (const player of table) {
    const [place, surname, name, rank, country, club, ...columns] = player;
    const games: H9Player['games'] = [];
    const scores: string[] = [];
    const egd = columns[columns.length - 1].startsWith('|') ? Number(columns.pop()!.slice(1)) : undefined;

    for (const col of columns) {
      const match = GAME_REGEX.exec(col);

      if (col === '?' || col === '0=') {
        games.push(null);
      } else if (match) {
        const { opponent, result, color, handicap, modifier } = match.groups!;

        games.push({
          color: color ? (color === 'w' ? 'white' : 'black') : undefined,
          handicap: handicap ? parseInt(handicap, 10) : undefined,
          opponent: Number(opponent),
          modifier: modifier as H9Game['modifier'],
          result: result as H9Game['result'],
        });
      } else {
        scores.push(col);
      }
    }

    results.push({
      place: Number(place),
      name: name.replace(/_/g, ' '),
      surname: surname.replace(/_/g, ' '),
      rank,
      country,
      club,
      games,
      scores,
      egd,
    });
  }

  const [country, location] = properties.PC.split(/,\s?/);

  return {
    id: properties.TC,
    name: properties.EV,
    location: location ?? country,
    country: location ? country : '',
    class: properties.CL as H9Tournament['class'],
    dates: properties.DT.split(',').map((date) => date.trim()),
    handicap: parseInt(properties.HA.slice(1), 10),
    komi: parseFloat(properties.KM),
    time: parseInt(properties.TM, 10),
    comments: properties.CM,
    results,
    other,
  };
}
