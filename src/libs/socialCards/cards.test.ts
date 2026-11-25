import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { merge } from 'lodash-es';
import type { Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { loadArchiveEventAcronyms } from './assets';
import {
  buildArchiveCardSpec,
  buildEditionCardSpec,
  buildEventGamesCardSpec,
  buildEventGeneralCardSpec,
  buildEventStatsCardSpec,
} from './cards';
import type { EventCardStatsInput } from './schema';

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

function createCardStatsInput(tournaments: Tournament[], sgfs = 28): EventCardStatsInput {
  return {
    tournaments,
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
  };
}

describe('social card spec builders', () => {
  it('caps archive selector acronyms and formats subtitle counts', () => {
    const configuration: ArchiveConfiguration = {
      title: 'European Go Championships Archives',
      domain: 'https://eurogofed.org',
      basePath: '/archives',
      events: [],
    };
    const t = createTranslator('en');
    const acronyms = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11'];

    const spec = buildArchiveCardSpec(configuration, acronyms, 'en', t);

    assert.equal(spec.eventAcronyms.length, 9);
    assert.equal(spec.extraEventsCount, 2);
    assert.match(spec.subtitle, /11 Go tournaments/);
  });

  it('builds general, stats, and games card specs and omits header archive name when repeated in title', () => {
    const tWithEventName = createTranslator('pl', {
      site: { name: 'Archiwum Mistrzostw Polski w\u00a0Go', eventName: 'Mistrzostwa Polski w Go', acronym: 'MP' },
    });
    const tWithoutEventName = createTranslator('en', {
      site: { name: 'European Go Championships Archive', acronym: 'EGC' },
    });
    const statsInput = createCardStatsInput([createTournament({ year: 2024 }), createTournament({ year: 2025 })], 28);
    const noSgfInput = createCardStatsInput([createTournament()], 0);

    const general = buildEventGeneralCardSpec(statsInput, tWithEventName);
    assert.equal(general.siteName, 'Archiwum Mistrzostw Polski w\u00a0Go');
    assert.deepEqual(general.pills, ['2024–2025', '2 edycje', '48 graczy', '28 partii SGF']);

    const noSgfGeneral = buildEventGeneralCardSpec(noSgfInput, tWithEventName);
    assert.equal(noSgfGeneral.subtitle, 'Wyniki, tabele i statystyki wszech czasów.');
    assert.equal(noSgfGeneral.pills.length, 3);

    const statsWithHeader = buildEventStatsCardSpec(statsInput, 'pl', tWithEventName);
    assert.equal(statsWithHeader.siteName, 'Archiwum Mistrzostw Polski w\u00a0Go');
    assert.equal(statsWithHeader.title, 'Mistrzostwa Polski w Go');
    assert.equal(
      statsWithHeader.subtitle,
      'Wyniki turniejów, zapisy partii, podsumowanie udziałów i statystyki graczy.'
    );
    assert.deepEqual(statsWithHeader.metrics, [
      { value: '2', label: 'edycje' },
      { value: '48', label: 'graczy' },
      { value: '140', label: 'partii' },
    ]);

    const statsNoSgf = buildEventStatsCardSpec(noSgfInput, 'en', tWithoutEventName);
    assert.equal(statsNoSgf.siteName, undefined);
    assert.equal(statsNoSgf.title, 'European Go Championships Archive');
    assert.equal(statsNoSgf.subtitle, 'Tournament results, participation summaries and player statistics.');

    const gamesWithHeader = buildEventGamesCardSpec(statsInput, tWithEventName);
    assert.equal(gamesWithHeader.siteName, 'Archiwum Mistrzostw Polski w\u00a0Go');
    assert.deepEqual(gamesWithHeader.pills, ['28 partii SGF', '2024–2025']);

    const gamesWithoutHeader = buildEventGamesCardSpec(statsInput, tWithoutEventName);
    assert.equal(gamesWithoutHeader.siteName, undefined);
    assert.equal(gamesWithoutHeader.title, 'European Go Championships Archive');
  });

  it('builds standard, tied-podium, categorized, and announcement edition cards using commas instead of dots', () => {
    const tPl = createTranslator('pl', {
      site: { name: 'Archiwum Mistrzostw Polski w Go', acronym: 'MP' },
    });

    const standard = buildEditionCardSpec(createEvent(), createTournament(), 'pl', tPl);
    assert.equal(standard.siteName, 'Archiwum Mistrzostw Polski w Go');
    assert.equal(standard.heading, 'MP 2025');
    assert.equal(standard.metaLine?.includes('·'), false);
    assert.match(standard.metaLine ?? '', /^Gdańsk, /);
    assert.equal(standard.statsLine, '3 graczy, 1 partia SGF');
    assert.deepEqual(standard.podium, [
      { rank: 1, names: 'Stanisław Frejlak' },
      { rank: 2, names: 'Cezary Czernecki' },
      { rank: 3, names: 'Koichiro Habu' },
    ]);

    const tiedFirst = buildEditionCardSpec(
      createEvent(),
      createTournament({ top: [['p1', 'p2'], [], ['p3']] }),
      'pl',
      tPl
    );
    assert.deepEqual(tiedFirst.podium, [
      { rank: 1, names: 'Stanisław Frejlak, Cezary Czernecki' },
      { rank: 3, names: 'Koichiro Habu' },
    ]);

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
    assert.equal(categorized.siteName, 'EYGC Archive');
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

  it('falls back to each event primary locale when loading archive selector acronyms', async () => {
    const acronyms = await loadArchiveEventAcronyms(
      [
        createEvent({ id: 'wagc', locales: ['en', 'pl'] }),
        createEvent({ id: 'wwgc', locales: ['en'] }),
        createEvent({ id: 'pgc', locales: ['pl', 'en'] }),
      ],
      'pl'
    );

    assert.deepEqual(acronyms, ['WAGC', 'WWGC', 'MP']);
  });
});
