import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildAllPlayersStatsMetadata } from '@/libs/metadata';
import { getAllPlayersStats, getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
import { AllPlayersStats } from '@/components/AllPlayersStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllPlayersPageProps = {
  event: EventContext;
  locale: Locale;
};

export async function AllPlayersPage({ event, locale }: AllPlayersPageProps) {
  const translations = await getTranslations(event, locale);
  const players = await getAllPlayersStats(event);
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsTitle')}</Title>
      <AllPlayersStats event={event} players={players} locale={locale} />
    </Content>
  );
}

export async function getAllPlayersPageMetadata({ event, locale }: AllPlayersPageProps): Promise<Metadata> {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const [translations, tournaments, summary] = await Promise.all([
    getTranslations(event, locale),
    getTournaments(event),
    getEventSummary(event),
  ]);

  return buildAllPlayersStatsMetadata({
    event,
    locale,
    t: getTranslator(translations),
    tournaments,
    totalStats: summary.totalStats,
  });
}

export async function getAllPlayersPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
