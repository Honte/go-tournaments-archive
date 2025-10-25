import { loadTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { getStats } from '@/data';
import { notFound } from 'next/navigation';
import { getTranslator } from '@/i18n/translator';
import { Achievements } from '@/components/stats/Achievements';
import { Events } from '@/components/stats/Events';
import { Opponents } from '@/components/stats/Opponents';

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;

  const translations = await loadTranslations(locale);
  const stats = getStats();
  const player = stats.players[slug];
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name)} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name) : t('site.description')
  };
}

export default async function PlayerStats({ params }) {
  const { locale, slug } = await params;

  const translations = await loadTranslations(locale);
  const stats = getStats();
  const player = stats.players[slug];

  if (!player) {
    return notFound();
  }

  return (
    <>
      <h1 className="text-4xl text-center font-bold">{player.name}</h1>

      <Achievements player={player} translations={translations}/>

      <div className="flex max-xl:flex-col gap-4">
        <Events player={player} translations={translations}/>
        <Opponents player={player} translations={translations} players={stats.players}/>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const stats = getStats();

  return Object.keys(stats.players).filter((key) => key !== 'BYE').map((slug) => SUPPORTED_LOCALES.map((locale) => ({
    locale,
    slug
  }))).flat();
}
