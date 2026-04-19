import EVENT_CONFIG from '@event/config';
import { getAllPlayersStats, getPlayerOpponentsStats, getPlayerStats } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { SUPPORTED_LOCALES, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { Achievements } from '@/components/stats/Achievements';
import { Events } from '@/components/stats/Events';
import { Opponents } from '@/components/stats/Opponents';
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
  const opponents = await getPlayerOpponentsStats(slug);

  if (!player) {
    return notFound();
  }

  return (
    <Content>
      <header className="flex flex-col">
        <Title>{player.name}</Title>
        {EVENT_CONFIG.showCountry && (
          <h2 className="text-xl text-center font-bold">
            {jsxJoin(
              Array.from(player.countries)
                .filter(Boolean)
                .map((country) => <CountryLink key={country} translations={translations} code={country} full={true} />),
              ', '
            )}
          </h2>
        )}
      </header>

      <Achievements player={player} translations={translations} />

      <div className="flex max-xl:flex-col gap-4">
        <Events player={player} translations={translations} />
        <Opponents opponents={opponents} translations={translations} />
      </div>
    </Content>
  );
}

export async function generateStaticParams() {
  const players = await getAllPlayersStats();

  return Object.keys(players)
    .filter((key) => key !== 'BYE')
    .map((slug) =>
      SUPPORTED_LOCALES.map((locale) => ({
        locale,
        slug,
      }))
    )
    .flat();
}
