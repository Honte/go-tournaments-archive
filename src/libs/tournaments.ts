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
  return tournaments
    .filter((tournament) => !tournament.announcement)
    .flatMap((tournament) => {
      const top = (category ? tournament.categoriesTop?.[category] : tournament.top) ?? [];
      const stagePlayers = tournament.stages.map((stage) => getStagePlayers(stage, category));
      const relevantStages = tournament.stages.filter(
        (stage, index) => !category || stage.category === category || stagePlayers[index].size > 0
      );
      if (category && !relevantStages.length && !tournament.categoriesTop?.[category]) {
        return [];
      }

      const playerIds = new Set(
        category ? [...stagePlayers.flatMap((players) => [...players]), ...top.flat()] : Object.keys(tournament.players)
      );
      const players = new Set(
        [...playerIds].map((id) => tournament.players[id]?.id).filter((id) => id && id !== 'BYE')
      );
      const games = Object.values(tournament.games).filter(
        (game) =>
          !game.players.some((player) => player.id === 'BYE') &&
          (!category || game.players.some((player) => stagePlayers[game.stage]?.has(player.id)))
      );
      const podium = (index: number) =>
        [...new Set(top[index] ?? [])].flatMap((id) => (tournament.players[id] ? [tournament.players[id]] : []));

      return [
        {
          year: tournament.year,
          location: tournament.location || undefined,
          country: tournament.country || undefined,
          start: tournament.start,
          end: tournament.end,
          dates:
            tournament.start && tournament.end
              ? formatRange(tournament.start, tournament.end, locale)
              : tournament.start || tournament.end
                ? formatDate((tournament.start ?? tournament.end)!, locale)
                : undefined,
          gold: podium(0),
          silver: podium(1),
          bronze: podium(2),
          players: players.size,
          stages: relevantStages.length,
          games: games.length,
          sgfs: games.filter((game) => game.props.sgf).length,
        },
      ];
    });
}

function getStagePlayers(stage: Stage, category?: string) {
  return new Set(
    stage.table
      .filter(
        (player) =>
          !category ||
          stage.category === category ||
          ('categories' in player && player.categories?.[category] !== undefined)
      )
      .map((player) => player.id)
  );
}

export function sortPodium(players: readonly Player[], locale: string, descending = false): Player[] {
  const collator = new Intl.Collator(locale);
  return players.toSorted((a, b) => comparePlayers(a, b, collator) * (descending ? -1 : 1));
}

function comparePlayers(a: Player, b: Player, collator: Intl.Collator) {
  const surname = (name: string) => name.trim().split(/\s+/).slice(1).join(' ') || name;
  return (
    collator.compare(surname(a.name), surname(b.name)) || collator.compare(a.name, b.name) || a.id.localeCompare(b.id)
  );
}

export function sortTournamentRows(
  rows: readonly TournamentRow[],
  key: TournamentSortKey,
  descending: boolean,
  locale: string,
  countryLabel: (code: string) => string
) {
  const collator = new Intl.Collator(locale);
  const direction = descending ? -1 : 1;
  const value = (row: TournamentRow) => {
    if (key === 'dates') {
      return row.start ?? row.end;
    }
    if (key === 'country') {
      return row.country ? countryLabel(row.country) : undefined;
    }
    return row[key];
  };
  return rows.toSorted((a, b) => {
    const av = value(a);
    const bv = value(b);
    const missing = (v: typeof av) => v === undefined || v === '' || (Array.isArray(v) && !v.length);
    if (missing(av) !== missing(bv)) {
      return missing(av) ? 1 : -1;
    }
    let compared = 0;
    if (Array.isArray(av) && Array.isArray(bv)) {
      const ap = sortPodium(av, locale, descending);
      const bp = sortPodium(bv, locale, descending);
      for (let index = 0; index < Math.min(ap.length, bp.length); index++) {
        compared = comparePlayers(ap[index], bp[index], collator);
        if (compared) {
          break;
        }
      }
      compared ||= ap.length - bp.length;
    } else if (typeof av === 'number' && typeof bv === 'number') {
      compared = av - bv;
    } else if (typeof av === 'string' && typeof bv === 'string') {
      compared =
        key === 'dates'
          ? Date.parse(av) - Date.parse(bv) || Date.parse(a.end ?? av) - Date.parse(b.end ?? bv)
          : collator.compare(av, bv);
    }
    return compared * direction || b.year - a.year;
  });
}
