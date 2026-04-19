import EVENT_CONFIG from '@event/config';
import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { WinnersTable } from '@/components/WinnersTable';
import { H1 } from '@/components/ui/H1';
import { H2 } from '@/components/ui/H2';

export type WinnersProps = {
  tournaments: Tournament[];
  translations: Translations;
};

export function Winners({ tournaments, translations }: WinnersProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1>{t('winners.title')}</H1>
      {EVENT_CONFIG.categories?.length ? (
        <CategoryWinners tournaments={tournaments} translations={translations} />
      ) : (
        <TotalWinners tournaments={tournaments} translations={translations} />
      )}
    </div>
  );
}

function CategoryWinners({ tournaments, translations }: WinnersProps) {
  const t = getTranslator(translations);

  return (
    <div className="flex flex-col gap-4">
      {EVENT_CONFIG.categories?.map((category) => (
        <div key={category}>
          <H2>{t(`categories.full.${category}`)} </H2>
          <WinnersTable results={getCategoryTop(tournaments, category)} translations={translations} />
        </div>
      ))}
    </div>
  );
}

function TotalWinners({ tournaments, translations }: WinnersProps) {
  return <WinnersTable translations={translations} results={tournaments} />;
}

function getCategoryTop(tournaments: Tournament[], category: string) {
  const results = [];

  for (const tournament of tournaments) {
    if (tournament.categoriesTop?.[category]) {
      results.push({
        year: tournament.year,
        top: tournament.categoriesTop[category],
        players: tournament.players,
      });
    }
  }

  return results;
}
