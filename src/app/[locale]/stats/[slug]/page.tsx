import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAllPlayersStats, getPlayerStats } from '@/data';
import { PlayerPage } from '@/components/pages/PlayerPage';

type PageProps = {
  params: Promise<{
    slug: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const player = await getPlayerStats(event, slug);
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name ?? '')} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name ?? '') : t('site.description'),
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const player = await getPlayerStats(event, slug);

  if (!player) {
    return notFound();
  }

  return <PlayerPage event={event} translations={translations} player={player} />;
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();
  const players = await getAllPlayersStats(event);

  return Object.keys(players)
    .filter((key) => key !== 'BYE')
    .map((slug) =>
      event.locales.map((locale) => ({
        locale,
        slug,
      }))
    )
    .flat();
}
