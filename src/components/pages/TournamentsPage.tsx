import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { getTranslations } from '@/data/serverApi';
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
