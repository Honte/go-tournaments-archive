import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { merge } from 'lodash-es';
import type { Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext, EventData } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  buildArchiveCardSpec,
  buildEditionCardSpec,
  buildEventGamesCardSpec,
  buildEventGeneralCardSpec,
  buildEventStatsCardSpec,
} from './cards';

const baseEn = JSON.parse(readFileSync('./src/i18n/en.json', 'utf-8')) as Translations;
const basePl = JSON.parse(readFileSync('./src/i18n/pl.json', 'utf-8')) as Translations;

function createTranslator(locale: Locale, overrides?: Record<string, unknown>) {
  const base = locale === 'pl' ? basePl : baseEn;
  const translations = merge({}, base, overrides, { locale }) as Translations;

  return getTranslator(translations);
}

function createEvent(overrides?: Partial<EventContext>): EventContext {
  return {
    id: 'pgc',
    locales: ['pl', 'en'],
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
      p1: { id: 'p1', name: 'Stanisław Frejlak' },
      p2: { id: 'p2', name: 'Cezary Czernecki' },
      p3: { id: 'p3', name: 'Koichiro Habu' },
    },
    games: {
      g1: {
        id: 'g1',
        stage: 0,
        players: [
          { id: 'p1', won: true },
          { id: 'p2', won: false },
        ],
        result: 'B+R',
        props: { sgf: '2025/g1.sgf' },
      },
    },
    stages: [],
    hasSgfs: true,
    ...overrides,
  };
}

function createEventData(tournaments: Tournament[], sgfs = 28): EventData {
  return {
    tournaments,
    stats: {
      summary: {
        tournaments: tournaments.filter((item) => !item.announcement).length,
        playedGames: 140,
        unresolved: 0,
        sgfs,
        resign: 70,
        timeout: 0,
        draws: 0,
        relays: 0,
        streams: 0,
        analysis: 0,
        players: 48,
        black: 72,
        white: 68,
        color: 140,
      },
      games: {},
      players: {},
      countries: {},
      categories: {},
    },
    summary: {
      attendants: [],
      medalists: [],
      countryMedals: [],
      totalStats: {
        tournaments: tournaments.filter((item) => !item.announcement).length,
        playedGames: 140,
        unresolved: 0,
        sgfs,
        resign: 70,
        timeout: 0,
        draws: 0,
        relays: 0,
        streams: 0,
        analysis: 0,
        players: 48,
        black: 72,
        white: 68,
        color: 140,
      },
    },
  };
}

describe('OG card spec builders', () => {
  it('caps archive selector acronyms and formats domain with basePath', () => {
    const configuration: ArchiveConfiguration = {
      title: 'European Go Championships Archives',
      domain: 'https://eurogofed.org',
      basePath: '/archives',
      events: [],
    };
    const t = createTranslator('en');
    const acronyms = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11'];

    const spec = buildArchiveCardSpec(configuration, acronyms, 'en', t);

    assert.equal(spec.displayDomain, 'eurogofed.org/archives');
    assert.equal(spec.eventAcronyms.length, 9);
    assert.equal(spec.extraEventsCount, 2);
    assert.match(spec.subtitle, /11 Go tournaments/);
  });

  it('builds general, stats, and games card specs without middle dots', () => {
    const event = createEvent();
    const t = createTranslator('pl', {
      site: { name: 'Archiwum Mistrzostw Polski w Go', eventName: 'Mistrzostwa Polski w Go', acronym: 'MP' },
    });
    const data = createEventData([createTournament({ year: 2024 }), createTournament({ year: 2025 })], 28);

    const general = buildEventGeneralCardSpec(event, data, 'pl', t);
    assert.equal(general.displayDomain, 'mp.go.art.pl');
    assert.deepEqual(general.pills, ['2024–2025', '2 edycje', '48 graczy', '28 partii SGF']);

    const noSgfGeneral = buildEventGeneralCardSpec(event, createEventData([createTournament()], 0), 'pl', t);
    assert.equal(noSgfGeneral.subtitle, 'Wyniki, tabele i statystyki wszech czasów.');
    assert.equal(noSgfGeneral.pills.length, 3);

    const stats = buildEventStatsCardSpec(data, 'pl', t);
    assert.equal(stats.badge, 'STATYSTYKI WSZECH CZASÓW');
    assert.deepEqual(stats.metrics, [
      { value: '2', label: 'edycje' },
      { value: '48', label: 'graczy' },
      { value: '140', label: 'partii' },
    ]);

    const games = buildEventGamesCardSpec(data, 'pl', t);
    assert.equal(games.badge, 'ZAPISY PARTII (SGF)');
    assert.deepEqual(games.pills, ['28 partii SGF', '2024–2025']);
  });

  it('builds standard, categorized, pairs, and announcement edition cards using commas instead of dots', () => {
    const tPl = createTranslator('pl', {
      site: { name: 'Archiwum Mistrzostw Polski w Go', acronym: 'MP' },
    });

    const standard = buildEditionCardSpec(createEvent(), createTournament(), 'pl', tPl);
    assert.equal(standard.heading, 'MP 2025');
    assert.equal(standard.metaLine?.includes('·'), false);
    assert.match(standard.metaLine ?? '', /^Gdańsk, /);
    assert.equal(standard.statsLine, '3 graczy, 1 partia SGF');
    assert.deepEqual(standard.podium, ['Stanisław Frejlak', 'Cezary Czernecki', 'Koichiro Habu']);

    const tEn = createTranslator('en', {
      site: { name: 'EYGC Archive', acronym: 'EYGC' },
      categories: {
        full: { u12: 'Under 12', u18: 'Under 18' },
        short: { u12: 'U12', u18: 'U18' },
      },
    });
    const categorized = buildEditionCardSpec(
      createEvent({
        id: 'eygc',
        locales: ['en'],
        prefix: 'eygc',
        basePath: '/archives',
        domain: 'https://eurogofed.org',
      }),
      createTournament({
        top: [],
        categoriesTop: { u12: [['p1']], u18: [['p2']] },
      }),
      'en',
      tEn
    );
    assert.equal(categorized.displayDomain, 'eurogofed.org/archives/eygc');
    assert.equal(categorized.podium.length, 0);
    assert.deepEqual(
      categorized.categoryWinners.map((item) => `${item.category}:${item.winner}`),
      ['U12:Stanisław Frejlak', 'U18:Cezary Czernecki']
    );

    const announcement = buildEditionCardSpec(
      createEvent({ locales: ['en'], showCountry: true }),
      createTournament({ year: 2026, location: 'Tokyo', country: 'JP', announcement: true, top: [] }),
      'en',
      tEn
    );
    assert.equal(announcement.upcomingBadge, 'UPCOMING EDITION');
    assert.equal(announcement.statsLine, undefined);
    assert.equal(announcement.podium.length, 0);
  });
});
