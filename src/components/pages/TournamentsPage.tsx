import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildTournamentsOverviewMetadata } from '@/libs/metadata';
import { getTournaments, getTranslations } from '@/data/serverApi';
import { Tournaments } from '@/components/Tournaments';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type TournamentsPageProps = { event: EventContext; locale: Locale };

export async function TournamentsPage({ event, locale }: TournamentsPageProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.tournamentsTitle')}</Title>
      <Tournaments event={event} locale={locale} />
    </Content>
  );
}

export async function getTournamentsPageMetadata({ event, locale }: TournamentsPageProps): Promise<Metadata> {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const [translations, tournaments] = await Promise.all([getTranslations(event, locale), getTournaments(event)]);

  return buildTournamentsOverviewMetadata({
    event,
    locale,
    t: getTranslator(translations),
    tournaments,
  });
}

export function getTournamentsPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
