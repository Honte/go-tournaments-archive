'use client';

import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { categoryUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { TournamentsTable } from '@/components/TournamentsTable';
import { H2 } from '@/components/ui/H2';
import { Loader } from '@/components/ui/Loader';
import { useTournamentTablesData } from '@/hooks/useTournamentTablesData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type TournamentsProps = { event: EventContext; locale: Locale };

export function Tournaments({ event, locale }: TournamentsProps) {
  const { data } = useTournamentTablesData(event);
  const { data: translations } = useTranslationsData(event, locale);

  if (!data || !translations) {
    return <Loader />;
  }

  const t = getTranslator(translations);

  return (
    <>
      {data.tables.map(({ category, rows, showSgfs }) => (
        <section key={category ?? 'all'}>
          {category && (
            <H2>
              <Link
                href={categoryUrl(event, locale, category)}
                className="text-archive-link hover:text-archive-link-hover underline underline-offset-2"
              >
                {t(`categories.full.${category}`)}
              </Link>
            </H2>
          )}
          <TournamentsTable event={event} rows={rows} translations={translations} showSgfs={showSgfs} />
        </section>
      ))}
    </>
  );
}
