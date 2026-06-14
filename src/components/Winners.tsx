import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { CategoryLink } from '@/components/category/CategoryLink';
import { H1 } from '@/components/ui/H1';
import { H2 } from '@/components/ui/H2';
import { WinnersTable, type WinnersTableProps } from '@/components/WinnersTable';

export type WinnersProps = {
  event: EventContext;
  tournaments: Tournament[];
  translations: Translations;
};

export function Winners({ event, tournaments, translations }: WinnersProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1>{t('winners.title')}</H1>
      {event.categories?.length ? (
        <CategoryWinners event={event} tournaments={tournaments} translations={translations} />
      ) : (
        <WinnersTable event={event} results={tournaments} translations={translations} />
      )}
    </div>
  );
}

function CategoryWinners({ event, tournaments, translations }: WinnersProps) {
  const t = getTranslator(translations);

  return (
    <div className="flex flex-col gap-4">
      {event.categories?.map((category) => (
        <div key={category}>
          <H2>
            <CategoryLink event={event} category={category} locale={translations.locale}>
              {t(`categories.full.${category}`)}
            </CategoryLink>{' '}
          </H2>
          <WinnersTable event={event} results={getCategoryTop(tournaments, category)} translations={translations} />
        </div>
      ))}
    </div>
  );
}

function getCategoryTop(tournaments: Tournament[], category: string) {
  const results: WinnersTableProps['results'] = [];

  for (const tournament of tournaments) {
    if (tournament.categoriesTop?.[category]) {
      results.push({
        year: tournament.year,
        top: tournament.categoriesTop[category],
        players: tournament.players,
      });
    } else if (tournament.categories?.includes(category) && tournament.announcement) {
      results.push({
        year: tournament.year,
        announcement: tournament.announcement,
        website: Array.isArray(tournament.website) ? tournament.website[0] : tournament.website,
      });
    }
  }

  return results;
}
