import type { CategoryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { CategoryCountryMedalTable } from '@/components/category/CategoryCountryMedalTable';
import { CategoryMedalTable } from '@/components/category/CategoryMedalTable';
import { CategoryResultsTable } from '@/components/category/CategoryResultsTable';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type CategoryPageProps = {
  event: EventContext;
  translations: Translations;
  stats: CategoryStats;
  category: string;
};

export function CategoryPage({ event, category, stats, translations }: CategoryPageProps) {
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return (
    <Content>
      <Title>{name}</Title>
      <div className="xl:grid xl:grid-cols-4 xl:gap-4">
        <CategoryResultsTable
          event={event}
          category={category}
          stats={stats}
          translations={translations}
          className="xl:col-span-3 xl:row-span-2"
        />
        {event.showCountry && <CategoryCountryMedalTable event={event} stats={stats} translations={translations} />}
        <CategoryMedalTable event={event} category={category} translations={translations} stats={stats} />
      </div>
    </Content>
  );
}
