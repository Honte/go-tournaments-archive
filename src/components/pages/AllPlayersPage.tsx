import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getAllPlayersStats, getTranslations } from '@/data/serverApi';
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

export async function getAllPlayersPageMetadata({ event, locale }: AllPlayersPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsDescription'),
  };
}

export async function getAllPlayersPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
