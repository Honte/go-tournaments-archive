import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { merge } from 'lodash-es';
import type { CategoryStats, CountryStats, PlayerStats, Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext, EventData } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  buildAllCountriesStatsMetadata,
  buildAllPlayersStatsMetadata,
  buildCategoryStatsMetadata,
  buildCountryStatsMetadata,
  buildEventHomeMetadata,
  buildEventLayoutMetadata,
  buildGamesMetadata,
  buildMultiArchiveLayoutMetadata,
  buildMultiArchivePageMetadata,
  buildPlayerStatsMetadata,
  buildTournamentMetadata,
  buildTournamentsOverviewMetadata,
} from './pages';
import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from './schema';

const baseEn = JSON.parse(readFileSync('./src/i18n/en.json', 'utf-8')) as Translations;
const basePl = JSON.parse(readFileSync('./src/i18n/pl.json', 'utf-8')) as Translations;

function createTranslations(locale: Locale, overrides?: Record<string, unknown>): Translations {
  const base = locale === 'pl' ? basePl : baseEn;

  return merge({}, base, overrides, { locale }) as Translations;
}

function createEvent(overrides?: Partial<EventContext>): EventContext {
  return {
    id: 'pgc',
    locales: ['pl', 'en'],
    showCountry: false,
    showBestPlace: true,
    domain: 'https://mp.go.art.pl',
    ...overrides,
  };
}

function createTournament(overrides?: Partial<Tournament>): Tournament {
  return {
    id: 2025,
    year: 2025,
    location: 'Gdańsk',
    country: 'PL',
    start: '2025-11-08',
    end: '2025-11-11',
    top: [['p1'], ['p2'], ['p3']],
    participants: {
      p1: { id: 'p1', name: 'Stanisław Frejlak', country: 'PL' },
      p2: { id: 'p2', name: 'Cezary Czernecki', country: 'PL' },
      p3: { id: 'p3', name: 'Koichiro Habu', country: 'JP' },
      p4: { id: 'p4', name: 'Jan Kowalski', country: 'PL' },
    },
    games: {
      g1: {
        id: 'g1',
        stage: 0,
        players: [
          { id: 'p1', won: true, color: 'black' },
          { id: 'p2', won: false, color: 'white' },
        ],
        result: 'B+R',
        props: { sgf: '2025/g1.sgf' },
      },
      g2: {
        id: 'g2',
        stage: 0,
        players: [
          { id: 'p1', won: true, color: 'black' },
          { id: 'p3', won: false, color: 'white' },
        ],
        result: 'B+2.5',
        props: { sgf: '2025/g2.sgf' },
      },
    },
    stages: [],
    hasSgfs: true,
    ...overrides,
  };
}

function createEventData(tournaments: Tournament[]): EventData {
  return {
    tournaments,
    stats: {
      summary: {
        tournaments: tournaments.filter((item) => !item.announcement).length,
        playedGames: 120,
        unresolved: 0,
        sgfs: 42,
        resign: 60,
        timeout: 2,
        draws: 0,
        relays: 10,
        streams: 5,
        analysis: 3,
        players: 35,
        black: 62,
        white: 58,
        color: 120,
      },
      games: {},
      players: {},
      countries: {
        PL: {
          code: 'PL',
          score: 10_000,
          bestPlace: 1,
          totalGames: 40,
          totalSgfs: 12,
          totalWon: 25,
          totalDrawn: 0,
          totalUnresolved: 0,
          medals: [['2025'], [], []],
          categoriesMedals: {},
          years: {},
        },
        JP: {
          code: 'JP',
          score: 1,
          bestPlace: 3,
          totalGames: 20,
          totalSgfs: 6,
          totalWon: 12,
          totalDrawn: 0,
          totalUnresolved: 0,
          medals: [[], [], ['2025']],
          categoriesMedals: {},
          years: {},
        },
      },
      categories: {},
    },
    summary: {
      attendants: [],
      medalists: [],
      countryMedals: [],
      totalStats: {
        tournaments: tournaments.filter((item) => !item.announcement).length,
        playedGames: 120,
        unresolved: 0,
        sgfs: 42,
        resign: 60,
        timeout: 2,
        draws: 0,
        relays: 10,
        streams: 5,
        analysis: 3,
        players: 35,
        black: 62,
        white: 58,
        color: 120,
      },
    },
  };
}

describe('event metadata builders', () => {
  it('builds single-event home metadata with locales, alternates, and social tags', () => {
    const event = createEvent();
    const translations = createTranslations('pl', {
      site: {
        name: 'Archiwum Mistrzostw Polski w Go',
        eventName: 'Mistrzostwa Polski w Go',
        acronym: 'MP',
      },
    });
    const t = getTranslator(translations);
    const data = createEventData([createTournament({ year: 2024 }), createTournament({ year: 2025 })]);

    const home = buildEventHomeMetadata({
      event,
      locale: 'pl',
      t,
      tournaments: data.tournaments,
      totalStats: data.summary.totalStats,
    });

    assert.equal(String(home.metadataBase), 'https://mp.go.art.pl/');
    assert.equal(home.title, 'Archiwum Mistrzostw Polski w Go');
    assert.equal(
      home.description,
      'Archiwum Mistrzostw Polski w Go: 2 edycje (2024–2025), 35 graczy, 120 partii, 42 zapisy SGF.'
    );
    assert.equal(home.alternates?.canonical, '/pl');
    assert.deepEqual(home.alternates?.languages, {
      pl: '/pl',
      en: '/en',
      'x-default': '/pl',
    });
    assert.equal(home.openGraph && 'type' in home.openGraph ? home.openGraph.type : undefined, 'website');
    assert.equal(home.openGraph?.siteName, 'Archiwum Mistrzostw Polski w Go');
    assert.equal(home.openGraph?.locale, 'pl_PL');
    assert.deepEqual(home.openGraph?.alternateLocale, ['en_US']);
    assert.deepEqual(home.openGraph?.images, [
      {
        url: '/social/pl/general.jpg',
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
        alt: 'Archiwum Mistrzostw Polski w Go',
        type: 'image/jpeg',
      },
    ]);
    assert.equal(home.twitter && 'card' in home.twitter ? home.twitter.card : undefined, 'summary_large_image');
    assert.deepEqual(home.twitter?.images, ['/social/pl/general.jpg']);
  });

  it('builds tournament metadata with standardized title, concise og:title, and comma-separated details', () => {
    const event = createEvent({
      id: 'wagc',
      locales: ['en'],
      showCountry: true,
      domain: 'https://wagc.go.art.pl',
    });
    const translations = createTranslations('en', {
      site: {
        name: 'World Amateur Go Championships Archive',
        eventName: 'World Amateur Go Championship',
        acronym: 'WAGC',
      },
    });
    const t = getTranslator(translations);
    const tournament = createTournament({ location: 'Vancouver', country: 'CA' });

    const meta = buildTournamentMetadata({ event, locale: 'en', t, tournament });

    assert.equal(meta.title, 'WAGC 2025 - World Amateur Go Championships Archive');
    assert.equal(meta.openGraph?.title, 'WAGC 2025');
    assert.equal(meta.twitter?.title, 'WAGC 2025');
    assert.equal(meta.description?.includes('·'), false);
    assert.match(meta.description ?? '', /^WAGC 2025 — Vancouver, Canada, .*, 4 players\./);
    assert.match(meta.description ?? '', /Podium: 1\. Stanisław Frejlak, 2\. Cezary Czernecki, 3\. Koichiro Habu\./);
    assert.match(meta.description ?? '', /2 SGF game records\.$/);
    assert.equal(meta.alternates?.languages, undefined);
    assert.deepEqual(meta.twitter?.images, ['/social/en/tournaments/2025.jpg']);
  });

  it('handles categorized, pairs, and announcement editions cleanly', () => {
    const tEn = getTranslator(
      createTranslations('en', {
        site: { name: 'EYGC Archive', eventName: 'EYGC', acronym: 'EYGC' },
        categories: {
          full: { u12: 'Under 12', u18: 'Under 18' },
          short: { u12: 'U12', u18: 'U18' },
        },
      })
    );

    const categorized = buildTournamentMetadata({
      event: createEvent({
        id: 'eygc',
        locales: ['en'],
        categories: ['u12', 'u18'],
        prefix: 'eygc',
        basePath: '/archives',
        domain: 'https://eurogofed.org',
      }),
      locale: 'en',
      t: tEn,
      tournament: createTournament({
        top: [],
        categories: ['u12', 'u18'],
        categoriesTop: { u12: [['p1']], u18: [['p2']] },
      }),
    });
    assert.match(categorized.description ?? '', /Categories: U12: Stanisław Frejlak, U18: Cezary Czernecki\./);
    assert.equal(categorized.alternates?.canonical, '/archives/eygc/en/2025');
    assert.deepEqual(categorized.twitter?.images, ['/archives/social/eygc/en/tournaments/2025.jpg']);

    const tPl = getTranslator(
      createTranslations('pl', {
        site: { name: 'Archiwum MPP', eventName: 'Mistrzostwa Polski Par', acronym: 'MPP' },
      })
    );
    const pairs = buildTournamentMetadata({
      event: createEvent({ id: 'ppgc', locales: ['pl'], pairs: true }),
      locale: 'pl',
      t: tPl,
      tournament: createTournament({
        top: [['pair1']],
        participants: {
          pair1: {
            id: 'pair1',
            members: [
              { id: 'a', name: 'Anna Nowak' },
              { id: 'b', name: 'Jan Kowalski' },
            ],
          },
        },
        games: {},
        hasSgfs: false,
      }),
    });
    assert.match(pairs.description ?? '', /1 para\./);
    assert.match(pairs.description ?? '', /Podium: 1\. Anna Nowak \/ Jan Kowalski\./);
    assert.match(pairs.description ?? '', /Pełne wyniki i tabele\.$/);

    const announcement = buildTournamentMetadata({
      event: createEvent({ id: 'wagc', locales: ['en'], showCountry: true }),
      locale: 'en',
      t: tEn,
      tournament: createTournament({
        year: 2026,
        location: 'Tokyo',
        country: 'JP',
        start: '2026-05-20',
        end: '2026-05-27',
        announcement: true,
        top: [],
        participants: {},
        games: {},
        hasSgfs: false,
      }),
    });
    assert.match(announcement.description ?? '', /^Upcoming edition of EYGC 2026 \(Tokyo, Japan,/);
    assert.equal(announcement.description?.includes('Podium'), false);
  });

  it('builds tournaments overview, stats, player, country, category, and games metadata', () => {
    const event = createEvent({
      id: 'wagc',
      locales: ['en'],
      showCountry: true,
      showBestPlace: true,
      domain: 'https://wagc.go.art.pl',
    });
    const translations = createTranslations('en', {
      site: {
        name: 'World Amateur Go Championships Archive',
        eventName: 'World Amateur Go Championship',
        acronym: 'WAGC',
      },
      categories: {
        full: { u18: 'Under 18' },
        short: { u18: 'U18' },
      },
    });
    const t = getTranslator(translations);
    const data = createEventData([
      createTournament({ year: 2024 }),
      createTournament({ year: 2025 }),
      createTournament({ year: 2026, announcement: true }),
    ]);

    const overview = buildTournamentsOverviewMetadata({
      event,
      locale: 'en',
      t,
      tournaments: data.tournaments,
    });
    assert.equal(overview.title, 'Tournaments - World Amateur Go Championships Archive');
    assert.match(overview.description ?? '', /2 editions \(2024–2025\)/);
    assert.deepEqual(overview.twitter?.images, ['/social/en/general.jpg']);

    const allPlayers = buildAllPlayersStatsMetadata({
      event,
      locale: 'en',
      t,
      tournaments: data.tournaments,
      totalStats: data.summary.totalStats,
    });
    assert.match(allPlayers.description ?? '', /35 players, 120 games across 2 editions \(2024–2025\)/);
    assert.deepEqual(allPlayers.twitter?.images, ['/social/en/stats.jpg']);

    const player: PlayerStats = {
      id: 'stanislaw-frejlak',
      name: 'Stanisław Frejlak',
      country: ['PL'],
      bestPlace: 1,
      totalGames: 20,
      totalWon: 15,
      totalDrawn: 1,
      totalUnresolved: 0,
      totalAttended: 4,
      totalSgfs: 12,
      score: 10_100,
      medals: [['2025'], ['2024'], []],
      categoriesMedals: {},
      results: [],
      opponents: {},
    };
    const playerMeta = buildPlayerStatsMetadata({ event, locale: 'en', t, player, category: 'u18' });
    assert.equal(playerMeta.title, 'Stanisław Frejlak - Stats (Under 18) - World Amateur Go Championships Archive');
    assert.equal(playerMeta.alternates?.canonical, '/en/stats/stanislaw-frejlak/u18');
    assert.match(
      playerMeta.description ?? '',
      /Stanisław Frejlak \(Poland\) in World Amateur Go Championship \(Under 18\): 4 appearances, 2 medals \(1G 1S\), best finish: #1, 15-4-1 record \(75%\)\./
    );

    const allCountries = buildAllCountriesStatsMetadata({
      event,
      locale: 'en',
      t,
      tournaments: data.tournaments,
      totalStats: data.summary.totalStats,
      countryCount: Object.keys(data.stats.countries).length,
    });
    assert.match(allCountries.description ?? '', /2 countries, 120 games across 2 editions \(2024–2025\)/);
    assert.deepEqual(allCountries.twitter?.images, ['/social/en/stats.jpg']);

    const country: CountryStats = {
      code: 'PL',
      score: 10_000,
      bestPlace: 1,
      totalGames: 10,
      totalSgfs: 4,
      totalWon: 7,
      totalDrawn: 0,
      totalUnresolved: 0,
      medals: [['2025'], [], []],
      categoriesMedals: {},
      years: {
        2025: {
          year: 2025,
          bestPlace: 1,
          totalWon: 7,
          totalDrawn: 0,
          totalUnresolved: 0,
          totalGames: 10,
          results: [
            { id: 'p1', year: 2025, place: 1, name: 'P1', medals: [[], [], []], categoriesMedals: {}, stages: [] },
            { id: 'p2', year: 2025, place: 2, name: 'P2', medals: [[], [], []], categoriesMedals: {}, stages: [] },
          ],
        },
      },
    };
    const countryMeta = buildCountryStatsMetadata({ event, locale: 'en', t, country });
    assert.equal(countryMeta.alternates?.canonical, '/en/stats/country/pl');
    assert.match(
      countryMeta.description ?? '',
      /Poland in World Amateur Go Championship: 1 edition, 2 players, 1 medal \(1G\), 7-3 record \(70%\)\./
    );

    const categoryStats: CategoryStats = {
      category: 'u18',
      tournaments: [
        { year: 2023, results: [] },
        { year: 2025, results: [] },
      ],
    };
    const categoryMeta = buildCategoryStatsMetadata({
      event,
      locale: 'en',
      t,
      category: 'u18',
      stats: categoryStats,
    });
    assert.equal(categoryMeta.alternates?.canonical, '/en/category/u18');
    assert.match(
      categoryMeta.description ?? '',
      /Under 18 in World Amateur Go Championship, 2 editions \(2023–2025\)\./
    );

    const gamesMeta = buildGamesMetadata({
      event,
      locale: 'en',
      t,
      tournaments: data.tournaments,
      totalStats: data.summary.totalStats,
    });
    assert.equal(gamesMeta.alternates?.canonical, '/en/stats/games');
    assert.match(gamesMeta.description ?? '', /42 SGF game records from 2 editions \(2024–2025\)/);
    assert.deepEqual(gamesMeta.twitter?.images, ['/social/en/games.jpg']);
  });

  it('builds multi-event selector metadata and respects basePath and generateSocialImages: false', () => {
    const configuration: ArchiveConfiguration = {
      title: { en: 'European Go Championships Archives', pl: 'Archiwa Mistrzostw Europy w Go' },
      domain: 'https://eurogofed.org',
      basePath: '/archives',
      locales: ['en'],
      events: [{ id: 'egc', prefix: 'egc' }],
    };
    const layoutMeta = buildMultiArchiveLayoutMetadata(configuration);
    assert.equal(String(layoutMeta.metadataBase), 'https://eurogofed.org/');
    assert.deepEqual(layoutMeta.icons, {
      icon: { url: '/archives/multi-icon.svg', type: 'image/svg+xml' },
      apple: { url: '/archives/multi-icon.png', type: 'image/png', sizes: '180x180' },
    });

    const t = getTranslator(createTranslations('en'));
    const selectorMeta = buildMultiArchivePageMetadata({
      configuration,
      events: [createEvent({ id: 'egc', prefix: 'egc' }), createEvent({ id: 'epc', prefix: 'epc' })],
      locale: 'en',
      t,
    });
    assert.equal(selectorMeta.title, 'European Go Championships Archives');
    assert.equal(selectorMeta.alternates?.canonical, '/archives');
    assert.deepEqual(selectorMeta.twitter?.images, ['/archives/social/archive/en.jpg']);
    assert.match(selectorMeta.description ?? '', /2 Go tournaments/);

    const noSocialEvent = createEvent({ domain: undefined, generateSocialImages: false });
    const eventLayout = buildEventLayoutMetadata(noSocialEvent, t);
    assert.equal(eventLayout.metadataBase, undefined);
    assert.equal(eventLayout.title, t('site.name'));

    const noSocialHome = buildEventHomeMetadata({
      event: noSocialEvent,
      locale: 'pl',
      t: getTranslator(createTranslations('pl')),
      tournaments: [createTournament()],
      totalStats: createEventData([createTournament()]).summary.totalStats,
    });
    assert.equal(noSocialHome.metadataBase, undefined);
    assert.equal(noSocialHome.openGraph?.images, undefined);
    assert.equal(noSocialHome.twitter?.images, undefined);
    assert.equal(
      noSocialHome.twitter && 'card' in noSocialHome.twitter ? noSocialHome.twitter.card : undefined,
      'summary'
    );

    const noSocialSelector = buildMultiArchivePageMetadata({
      configuration: { ...configuration, config: { generateSocialImages: false } },
      events: [createEvent({ id: 'egc', prefix: 'egc' })],
      locale: 'en',
      t,
    });
    assert.equal(noSocialSelector.openGraph?.images, undefined);
    assert.equal(
      noSocialSelector.twitter && 'card' in noSocialSelector.twitter ? noSocialSelector.twitter.card : undefined,
      'summary'
    );
  });

  it('preserves podium ranks on ties and avoids double periods in Polish player descriptions', () => {
    const tEn = getTranslator(
      createTranslations('en', {
        site: { name: 'WAGC Archive', eventName: 'WAGC', acronym: 'WAGC' },
      })
    );
    const tiedMeta = buildTournamentMetadata({
      event: createEvent({ id: 'wagc', locales: ['en'] }),
      locale: 'en',
      t: tEn,
      tournament: createTournament({ top: [['p1', 'p2'], [], ['p3']] }),
    });
    assert.match(tiedMeta.description ?? '', /Podium: 1\. Stanisław Frejlak, Cezary Czernecki, 3\. Koichiro Habu\./);

    const tPl = getTranslator(
      createTranslations('pl', {
        site: { name: 'Archiwum MP', eventName: 'Mistrzostwa Polski w Go', acronym: 'MP' },
      })
    );
    const playerWithoutGames: PlayerStats = {
      id: 'stanislaw-frejlak',
      name: 'Stanisław Frejlak',
      country: ['PL'],
      bestPlace: 1,
      totalGames: 0,
      totalWon: 0,
      totalDrawn: 0,
      totalUnresolved: 0,
      totalAttended: 1,
      totalSgfs: 0,
      score: 10_000,
      medals: [['2025'], [], []],
      categoriesMedals: {},
      results: [],
      opponents: {},
    };
    const plPlayerMeta = buildPlayerStatsMetadata({
      event: createEvent({ id: 'pgc', locales: ['pl'], showBestPlace: true }),
      locale: 'pl',
      t: tPl,
      player: playerWithoutGames,
    });
    assert.match(plPlayerMeta.description ?? '', /najlepsze: 1\. miejsce\.$/);
    assert.equal(plPlayerMeta.description?.includes('..'), false);
  });
});
