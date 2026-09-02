import type { EventData, EventDefinition } from '@/schema/event';
import type {
  CountrySearchEntry,
  PlayerSearchEntry,
  SearchEntry,
  SearchIndex,
  TournamentSearchEntry,
} from '@/schema/search';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getString } from '@/i18n/utils';
import { tokenizeSearchText } from '@/libs/search';
import type { EventPlayer } from '@/data/eventPlayers';

export function buildSearchIndex(
  event: EventDefinition,
  data: EventData,
  translations: Translations,
  eventPlayers: EventPlayer[] = []
): SearchIndex {
  const t = getTranslator(translations, { allowMissing: true });
  const playerRegistry = new Map(eventPlayers.map((player) => [player.id, player]));
  const { playerCounts, countryCounts } = collectGameCounts(data);

  const tournaments = data.tournaments.map<TournamentSearchEntry>((tournament) => {
    const name = getString(tournament.name, translations.locale) ?? t('site.eventName') ?? '';
    const location = tournament.location ?? null;
    const country = tournament.country ?? null;

    return [
      tournament.year,
      name,
      location,
      country,
      ...getAdditionalSearchTerms(tournament.year, name, [tournament.referee]),
    ];
  });

  const players = Object.values(data.stats.players)
    .filter((player) => player.id !== 'BYE')
    .toSorted((a, b) => a.id.localeCompare(b.id))
    .map<PlayerSearchEntry>((player) => {
      const registry = playerRegistry.get(player.id);
      const country = event.showCountry ? (registry?.country ?? player.country.at(-1) ?? null) : null;

      return [
        player.id,
        player.name,
        playerCounts.get(player.id) ?? 0,
        country,
        ...getAdditionalSearchTerms(player.id, player.name, [
          ...player.results.map((result) => result.name),
          player.original,
          ...(player.nickname ?? []),
          registry?.name,
          registry?.original,
          ...(registry?.nickname ?? []),
          ...(registry?.pastNames ?? []),
        ]),
      ];
    });

  const countries = event.showCountry
    ? Object.values(data.stats.countries)
        .toSorted((a, b) => a.code.localeCompare(b.code))
        .map<CountrySearchEntry>((country) => {
          const name = t(`country.${country.code}`) ?? country.code;

          return [country.code, name, countryCounts.get(country.code.toUpperCase()) ?? 0];
        })
    : undefined;

  const categories = event.categories?.map<SearchEntry<string>>((category) => {
    const name = t(`categories.full.${category}`) ?? category;
    const shortName = t(`categories.short.${category}`);

    return createSearchEntry(category, name, [shortName]);
  });

  return {
    tournaments,
    players,
    ...(countries?.length ? { countries } : {}),
    ...(categories?.length ? { categories } : {}),
  };
}

export function createSearchEntry<T extends string | number>(
  navigationId: T,
  displayName: string,
  phrases: (string | undefined)[]
): SearchEntry<T> {
  return [navigationId, displayName, ...getAdditionalSearchTerms(navigationId, displayName, phrases)];
}

function getAdditionalSearchTerms(navigationId: string | number, displayName: string, phrases: (string | undefined)[]) {
  const derived = new Set([...tokenizeSearchText(String(navigationId)), ...tokenizeSearchText(displayName)]);
  const additional = new Set<string>();

  for (const phrase of phrases) {
    for (const term of tokenizeSearchText(phrase)) {
      if (!derived.has(term)) {
        additional.add(term);
      }
    }
  }

  return [...additional];
}

function collectGameCounts(data: EventData) {
  const playerCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();

  for (const tournament of data.tournaments) {
    for (const game of Object.values(tournament.games)) {
      if (!game.path || !game.props.sgf) {
        continue;
      }

      const gameCountries = new Set<string>();

      for (const player of game.players) {
        const tournamentPlayer = tournament.players[player.id];
        const navigationId = tournamentPlayer?.id ?? player.id;

        if (navigationId === 'BYE') {
          continue;
        }

        playerCounts.set(navigationId, (playerCounts.get(navigationId) ?? 0) + 1);

        if (tournamentPlayer?.country) {
          gameCountries.add(tournamentPlayer.country.toUpperCase());
        }
      }

      for (const country of gameCountries) {
        countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
      }
    }
  }

  return { playerCounts, countryCounts };
}
