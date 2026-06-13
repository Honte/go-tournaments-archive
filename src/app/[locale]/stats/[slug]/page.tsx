import EVENT_CONFIG from '@event/config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { getAllPlayersStats, getPlayerStats } from '@/data';
import { PlayerStats } from '@/components/PlayerStats';
import { Achievements } from '@/components/stats/Achievements';
import { Content } from '@/components/ui/Content';
import { CountryLink } from '@/components/ui/CountryLink';
import { Title } from '@/components/ui/Title';

type PageProps = {
  params: Promise<{
    slug: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  const translations = await loadTranslations(locale);
  const player = await getPlayerStats(slug);
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name ?? '')} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name ?? '') : t('site.description'),
  };
}

export default async function PlayerStatsPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const translations = await loadTranslations(locale);
  const player = await getPlayerStats(slug);

  if (!player) {
    return notFound();
  }

  return (
    <Content>
      <header className="flex flex-col">
        <Title>{player.name}</Title>
        {EVENT_CONFIG.showCountry && player.country && (
          <h2 className="text-xl text-center font-bold">
            {jsxJoin(
              player.country
                .filter(Boolean)
                .map((country) => <CountryLink key={country} translations={translations} code={country} full={true} />),
              ', '
            )}
          </h2>
        )}
      </header>

      <Achievements
        player={player}
        translations={translations}
        categories={EVENT_CONFIG.categories}
        showBestPlace={EVENT_CONFIG.showBestPlace}
      />
      <PlayerStats slug={slug} locale={locale} />
    </Content>
  );
}

export async function generateStaticParams() {
  const players = await getAllPlayersStats();

  return Object.keys(players)
    .filter((key) => key !== 'BYE')
    .map((slug) =>
      EVENT_CONFIG.locales.map((locale) => ({
        locale,
        slug,
      }))
    )
    .flat();
}
