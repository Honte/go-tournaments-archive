import type { CategoryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getCategoryMedalists } from '@/libs/category';
import { MedalTable } from '@/components/MedalTable';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

export type CategoryMedalTableProps = {
  event: EventContext;
  category: string;
  stats: CategoryStats;
  translations: Translations;
};

export function CategoryMedalTable({ event, category, stats, translations }: CategoryMedalTableProps) {
  const medalists = getCategoryMedalists(stats);
  const t = getTranslator(translations);

  return (
    <div className="flex-1 flex-col">
      <H1>{t('details.awardedIn', t(`categories.short.${category}`))}</H1>
      <MedalTable
        translations={translations}
        results={medalists}
        toKey={(player) => player.id}
        toName={(player) => (
          <PlayerLink event={event} playerId={player.id} locale={translations.locale}>
            <PlayerName player={player} showRank={false} showCountry={event.showCountry} />
          </PlayerLink>
        )}
      />
    </div>
  );
}
