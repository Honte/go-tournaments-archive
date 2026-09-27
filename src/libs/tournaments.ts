import type { Player, Stage, Tournament } from '@/schema/data';

export type TournamentRow = {
  year: number;
  location?: string;
  country?: string;
  start?: string;
  end?: string;
  gold: Player[];
  silver: Player[];
  bronze: Player[];
  referee?: string;
  players: number;
  stages: number;
  games: number;
  sgfs: number;
};

export type PodiumKey = 'gold' | 'silver' | 'bronze';

export function buildTournamentRows(tournaments: readonly Tournament[], category?: string): TournamentRow[] {
  const rows: TournamentRow[] = [];

  for (const tournament of tournaments) {
    const row = buildTournamentRow(tournament, category);
    if (row) {
      rows.push(row);
    }
  }

  return rows;
}

function buildTournamentRow(tournament: Tournament, category?: string): TournamentRow | undefined {
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
