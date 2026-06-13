import type { CategoryStats } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getCategoryMedalists } from '@/libs/category';
import { MedalTable } from '@/components/MedalTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

export type CategoryMedalTableProps = {
  category: string;
  stats: CategoryStats;
  translations: Translations;
  showCountry?: boolean;
};

export function CategoryMedalTable({ category, stats, translations, showCountry }: CategoryMedalTableProps) {
  const medalists = getCategoryMedalists(stats);
  const t = getTranslator(translations);

  return (
    <div className="flex-1 flex-col">
      <H2>{t('details.awardedIn', t(`categories.short.${category}`))}</H2>
      <MedalTable
        translations={translations}
        results={medalists}
        toKey={(player) => player.id}
        toName={(player) => (
          <PlayerLink playerId={player.id} locale={translations.locale}>
            <PlayerName player={player} showRank={false} showCountry={showCountry} />
          </PlayerLink>
        )}
      />
    </div>
  );
}
