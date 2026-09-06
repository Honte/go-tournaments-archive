import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildTournamentRows } from '@/libs/tournaments';
import { categoryUrl } from '@/libs/urls';
import { getTournaments, getTranslations } from '@/data/serverApi';
import { Link } from '@/components/navigation/Link';
import { TournamentsTable } from '@/components/TournamentsTable';
import { Content } from '@/components/ui/Content';
import { H2 } from '@/components/ui/H2';
import { Title } from '@/components/ui/Title';

type TournamentsPageProps = { event: EventContext; locale: Locale };

export async function TournamentsPage({ event, locale }: TournamentsPageProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const [tournaments, translations] = await Promise.all([getTournaments(event), getTranslations(event, locale)]);
  const t = getTranslator(translations);
  const categories = event.categories?.length ? event.categories : [undefined];

  return (
    <Content>
      <Title>{t('site.tournamentsTitle')}</Title>
      {categories.map((category) => {
        const rows = buildTournamentRows(tournaments, category, locale);

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
              showSgfs={!category && tournaments.some((tournament) => tournament.hasSgfs)}
            />
          </section>
        );
      })}
    </Content>
  );
}

export async function getTournamentsPageMetadata({ event, locale }: TournamentsPageProps) {
  const t = getTranslator(await getTranslations(event, locale));
  return {
    title: `${t('site.tournamentsTitle')} - ${t('site.name')}`,
    description: t('site.tournamentsDescription'),
  };
}

export function getTournamentsPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
