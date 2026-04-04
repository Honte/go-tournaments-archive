import { getStats } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { SUPPORTED_LOCALES, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { Achievements } from '@/components/stats/Achievements';
import { Events } from '@/components/stats/Events';
import { Opponents } from '@/components/stats/Opponents';

type PageProps = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  const translations = await loadTranslations(locale as Locale);
  const stats = await getStats();
  const player = stats.players[slug];
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name ?? '')} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name ?? '') : t('site.description'),
  };
}

export default async function PlayerStatsPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const translations = await loadTranslations(locale as Locale);
  const stats = await getStats();
  const player = stats.players[slug];

  if (!player) {
    return notFound();
  }

  return (
    <>
      <h1 className="text-4xl text-center font-bold">{player.name}</h1>

      <Achievements player={player} translations={translations} />

      <div className="flex max-xl:flex-col gap-4">
        <Events player={player} translations={translations} />
        <Opponents player={player} translations={translations} players={stats.players} />
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const stats = await getStats();

  return Object.keys(stats.players)
    .filter((key) => key !== 'BYE')
    .map((slug) =>
      SUPPORTED_LOCALES.map((locale) => ({
        locale,
        slug,
      }))
    )
    .flat();
}
