import { loadTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { getStats } from '@/data';
import { notFound } from 'next/navigation';
import { H1 } from '@/components/ui/h1';
import { getTranslator } from '@/i18n/translator';
import { Achievements } from '@/components/stats/achievements';
import { Events } from '@/components/stats/events';
import { Opponents } from '@/components/stats/opponents';

export async function generateMetadata({ params: { slug, locale } }) {
  const translations = await loadTranslations(locale);
  const stats = getStats();
  const player =  stats.players[slug];
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name)} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name) : t('site.description')
  };
}

export default async function PlayerStats({ params: { slug, locale } }) {
  const translations = await loadTranslations(locale);
  const t = getTranslator(translations)
  const stats = getStats();
  const player =  stats.players[slug];

  if (!player) {
    return notFound()
  }

  return (
    <>
      <H1>{player.name}</H1>

      <Achievements player={player} translations={translations}/>

      <div className="flex max-xl:flex-col gap-4">
        <Events player={player} translations={translations}/>
        <Opponents player={player} translations={translations} players={stats.players}/>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const stats = getStats();

  return Object.keys(stats.players).filter((key) => key !== 'BYE').map((slug) => SUPPORTED_LOCALES.map((locale) => ({
    locale,
    slug
  }))).flat();
}
