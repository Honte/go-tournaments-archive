'use client';

import { useId, useState } from 'react';
import type { CountrySummary, PlayerSummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { playerUrl } from '@/libs/urls';
import { AllCountriesStatsLink } from '@/components/AllCountriesStatsLink';
import { CountryMedalists } from '@/components/CountryMedalists';
import { MedalTable } from '@/components/MedalTable';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { H1 } from '@/components/ui/H1';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PlayerName } from './ui/PlayerName';

type MedalistView = 'individuals' | 'countries';

type MedalistsProps = {
  countries: CountrySummary[];
  event: EventContext;
  players: PlayerSummary[];
  translations: Translations;
};

export function Medalists({ countries, event, players, translations }: MedalistsProps) {
  const t = getTranslator(translations);
  const [view, setView] = useState<MedalistView>('individuals');
  const contentId = useId();
  const showViewSwitch = event.showCountry && countries.length > 0;
  const playerTable = (results: PlayerSummary[]) => (
    <MedalTable
      translations={translations}
      results={results}
      toKey={(player) => player.id}
      toName={(player) => <PlayerName player={player} showRank={false} showCountry={showViewSwitch} />}
      toHref={(player) => playerUrl(event, translations.locale, player.id)}
      toLinkLabel={(player) => player.name}
    />
  );
  const countryTable = (results: CountrySummary[]) => (
    <CountryMedalists event={event} countries={results} translations={translations} />
  );

  return (
    <div className="flex h-full flex-col">
      <H1
        className="mt-0 mb-2 min-h-9"
        actions={
          showViewSwitch ? (
            <SegmentedControl
              label={t('stats.medalistView.label')}
              value={view}
              options={(['individuals', 'countries'] as const).map((option) => ({
                value: option,
                label: t(`stats.medalistView.${option}`),
              }))}
              controlsId={contentId}
              onChange={setView}
            />
          ) : undefined
        }
      >
        {t('stats.medalists')}
      </H1>
      <div id={contentId} className="grid min-h-0 flex-1 overflow-hidden">
        {view === 'individuals' ? (
          <div key="individuals" className="min-w-0">
            {players.length > 10 ? (
              <ExpandableContent
                collapsed={playerTable(players.slice(0, 10))}
                expanded={playerTable(players)}
                moreLabel={t('actions.showAllMedalists')}
                lessLabel={t('actions.showLess')}
              />
            ) : (
              playerTable(players)
            )}
          </div>
        ) : showViewSwitch ? (
          <div key="countries" className="flex min-w-0 flex-col">
            {countries.length > 10 ? (
              <ExpandableContent
                collapsed={countryTable(countries.slice(0, 10))}
                expanded={countryTable(countries)}
                moreLabel={t('actions.showAllMedalists')}
                lessLabel={t('actions.showLess')}
                actions={<AllCountriesStatsLink event={event} translations={translations} />}
              />
            ) : (
              <>
                {countryTable(countries)}
                <div className="mt-auto">
                  <AllCountriesStatsLink event={event} translations={translations} />
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
