'use client';

import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { buildTournamentRows } from '@/libs/tournaments';
import { categoryUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { TournamentsTable } from '@/components/TournamentsTable';
import { H2 } from '@/components/ui/H2';
import { Loader } from '@/components/ui/Loader';
import { useTournamentsData } from '@/hooks/useTournamentsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type TournamentsProps = { event: EventContext; locale: Locale };

export function Tournaments({ event, locale }: TournamentsProps) {
  const { data: tournaments } = useTournamentsData(event);
  const { data: translations } = useTranslationsData(event, locale);

  if (!tournaments || !translations) {
    return <Loader />;
  }

  const t = getTranslator(translations);
  const categories = event.categories?.length ? event.categories : [undefined];

  return (
    <>
      {categories.map((category) => {
        const rows = buildTournamentRows(tournaments, category);

        if (!rows.length) {
          return null;
        }

        return (
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
            <TournamentsTable
              event={event}
              rows={rows}
              translations={translations}
              showSgfs={Boolean(
                event.generateSgfs && !category && tournaments.some((tournament) => tournament.hasSgfs)
              )}
            />
          </section>
        );
      })}
    </>
  );
}
