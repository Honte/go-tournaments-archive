import EVENT_CONFIG from '@event/config';
import type { ApiPlayerResult, ApiPlayerStats } from '@/schema/api';
import type { Stage } from '@/schema/data';
import { CustomSgfProps, SgfRootProps } from '@/schema/sgf';
import type { RootParams } from '@tools/sgf';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { loadTournaments } from '@/data/load';
import { calculateStats } from '@/data/stats';
import pkg from '../../package.json';

const tournaments = await loadTournaments();
const stats = calculateStats(tournaments);

export async function getTournaments() {
  return tournaments;
}

export async function getTournament(year: number) {
  return tournaments.find((t) => t.year === year);
}

export async function getTournamentList() {
  return tournaments.map((t) => ({
    year: t.year,
    location: t.location,
    country: t.country,
  }));
}

export async function getAvailableTournaments() {
  return tournaments.map((t) => t.year);
}

export async function getAllPlayersStats() {
  return stats.players;
}

export async function getPlayerStats(playerId: string): Promise<ApiPlayerStats> {
  const player = stats.players[playerId];
  const events: Record<number, ApiPlayerResult> = {};
  const opponents: Record<string, string> = {};

  for (const result of player.results) {
    const event = (events[result.year] ||= {
      year: result.year,
      country: result.country,
      stages: [],
      place: result.finalPlace,
      rank: result.rank,
    });

    if (result.finalPlace && !event.place) {
      event.place = result.finalPlace;
    }

    event.stages.push({
      type: result.stage,
      place: result.place,
      games: result.games,
    });

    for (const game of result.games) {
      if (game.id !== 'BYE') {
        opponents[game.id] = stats.players[game.id].name;
      }
    }
  }

  return {
    id: player.id,
    name: player.name,
    country: player.countries,
    medals: player.medals,
    categoriesMedals: player.categoriesMedals,
    results: Object.values(events).sort((a, b) => a.year - b.year),
    bestPlace: player.bestPlace,
    totalGames: player.totalGames,
    totalWon: player.totalWon,
    opponents,
  };
}

export async function getAllCountriesStats() {
  return stats.countries;
}

export async function getCountryStats(country: string) {
  return stats.countries[country];
}

export async function getPlayerMedalists() {
  return Object.values(stats.players)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getCountryMedals() {
  return Object.values(stats.countries)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getTopAttendants(limit: number) {
  return Object.values(stats.players)
    .sort((a, b) => b.years.length - a.years.length)
    .slice(0, limit);
}

export async function getTotalStats() {
  return stats.summary;
}

export async function getCategoryStats(category: string) {
  return stats.categories[category];
}

export async function getGameDetails(sgf: string) {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game.props.sgf === sgf) {
        let gameStage: Stage | undefined;
        let gameRound: number | undefined;
        let gameIndex: number | undefined;

        for (const stage of tournament.stages) {
          switch (stage.type) {
            case 'tournament':
            case 'ladder-table':
            case 'league':
              for (const [roundNo, round] of stage.rounds.entries()) {
                const gameNo = round.indexOf(id);

                if (gameNo >= 0) {
                  gameStage = stage;
                  gameRound = roundNo;
                  gameIndex = gameNo;
                  break;
                }
              }
              break;
            default:
              const gameNo = stage.games.indexOf(id);

              if (gameNo >= 0) {
                gameStage = stage;
                gameRound = undefined;
                gameIndex = gameNo;
                break;
              }
          }
        }

        const translations = await loadTranslations('en');
        const t = getTranslator(translations);
        const black = tournament.players[game.players[0].id];
        const white = tournament.players[game.players[1].id];

        return {
          [SgfRootProps.ENCODING]: 'utf-8',
          [SgfRootProps.GAME_TYPE]: 1,
          [SgfRootProps.FILE_FORMAT]: 4,
          [SgfRootProps.BOARD_SIZE]: (val?: string) => (val ? Number(val) : 19),
          [SgfRootProps.APPLICATION]: `${pkg.name}:${pkg.version}`,
          [SgfRootProps.EVENT_LOCATION]: tournament.country
            ? `${tournament.country},${tournament.location}`
            : tournament.location,
          [SgfRootProps.GAME_RESULT]: game.result,
          [SgfRootProps.BLACK_NAME]: black.name,
          [SgfRootProps.BLACK_RANK]: black.rank,
          [SgfRootProps.BLACK_TEAM]: (EVENT_CONFIG.showCountry && black.country) || null,
          [SgfRootProps.WHITE_NAME]: white.name,
          [SgfRootProps.WHITE_RANK]: white.rank,
          [SgfRootProps.WHITE_TEAM]: (EVENT_CONFIG.showCountry && white.country) || null,
          [SgfRootProps.COPYRIGHT]: null,
          [SgfRootProps.GAME_NAME]: null,
          [SgfRootProps.GAME_KOMI]: (val?: string) => val ?? gameStage?.komi ?? null,
          [SgfRootProps.GAME_DATE]: (val?: string) =>
            val ?? tournament.start?.split('-').slice(0, -1).join('-') ?? null,
          [SgfRootProps.EVENT_NAME]:
            (tournament.name && typeof tournament.name === 'object' ? tournament.name.en : tournament.name) ??
            `${t('site.acronym')} ${tournament.year}`,
          [SgfRootProps.GAME_RULES]: (val?: string) => (val ? val.toLowerCase() : null),
          [SgfRootProps.GAME_ROUND]: gameStage && gameRound ? `${gameRound + 1} (${gameStage.type})` : null,
          [SgfRootProps.COMMENT]: `Exported from ${t('site.name')}${EVENT_CONFIG.domain ? ` (${EVENT_CONFIG.domain})` : ''}`,

          // additional attributes for SGF Viewer
          [CustomSgfProps.BLACK_ID]: black.id,
          [CustomSgfProps.WHITE_ID]: white.id,
          [CustomSgfProps.GAME_AI]: game.props.ai || null,
          [CustomSgfProps.GAME_YT]: game.props.yt || null,
          [CustomSgfProps.GAME_OGS]: game.props.ogs || null,
        } satisfies RootParams;
      }
    }
  }

  return undefined;
}
