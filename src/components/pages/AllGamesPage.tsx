import { Suspense } from 'react';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getTranslations } from '@/data/serverApi';
import { AllGames } from '@/components/stats/AllGames';
import { Content } from '@/components/ui/Content';
import { Loader } from '@/components/ui/Loader';

type AllGamesPageProps = {
  event: EventContext;
  locale: Locale;
};

export async function AllGamesPage({ event, locale }: AllGamesPageProps) {
  return (
    <Content>
      <Suspense fallback={<Loader />}>
        <AllGames event={event} locale={locale} />
      </Suspense>
    </Content>
  );
}

export async function getAllGamesMetadata({ event, locale }: AllGamesPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.gamesListTitle')} - ${t('site.name')}`,
    description: t('site.gamesListDescription'),
  };
}

export async function getAllGamesPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
