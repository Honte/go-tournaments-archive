import EVENT_CONFIG from '@event/config';
import { getCategoryStats } from '@/data';
import type { StatsCategory, StatsMedals } from '@/schema/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type Locale, SUPPORTED_LOCALES } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { MedalTable } from '@/components/MedalTable';
import { Content } from '@/components/ui/Content';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { Title } from '@/components/ui/Title';
import { H2 } from '@/components/ui/H2';

type PageProps = {
  params: Promise<{
    locale: Locale;
    category: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return {
    title: `${t('site.categoryStatsTitle', name)} - ${t('site.name')}`,
    description: t('site.categoryStatsDescription', name),
  };
}

export default async function CategoryStats({ params }: PageProps) {
  if (!EVENT_CONFIG.categories?.length) {
    return notFound();
  }

  const { locale, category } = await params;

  const translations = await loadTranslations(locale);
  const stats = await getCategoryStats(category);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);
  const medalists = getMedalists(stats);

  return (
    <Content>
      <Title>{name}</Title>
      <div className="flex max-sm:flex-col-reverse gap-4">
        <div className="flex-2 bg-gray-200 p-8"></div>
        <div className="flex-1 flex-col">
          <H2>{t('details.awardedIn', t(`categories.short.${category}`))}</H2>
          <MedalTable
            translations={translations}
            results={medalists}
            toKey={(player) => player.id}
            toName={(player) => (
              <PlayerLink playerId={player.id} locale={translations.locale}>
                <PlayerName player={player} includeRank={false} />
              </PlayerLink>
            )}
          />
        </div>
      </div>
    </Content>
  );
}

export async function generateStaticParams() {
  if (!EVENT_CONFIG.categories?.length) {
    return [
      {
        category: 'none',
        locale: 'en',
      },
    ];
  }

  const pages = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const category of EVENT_CONFIG.categories) {
      pages.push({ locale, category });
    }
  }

  return pages;
}

function getMedalists(stats: StatsCategory) {
  const medalists: Record<string, { id: string; name: string; medals: StatsMedals }> = {};

  for (const tournament of stats.tournaments) {
    for (const player of tournament.results) {
      if (typeof player.place === 'number' && player.place <= 3) {
        medalists[player.id] ||= {
          id: player.id,
          name: player.name,
          medals: [[], [], []],
        };

        medalists[player.id].medals[player.place - 1].push(String(tournament.year));
      }
    }
  }

  return Object.values(medalists).sort(
    (a, b) =>
      b.medals[0].length - a.medals[0].length ||
      b.medals[1].length - a.medals[1].length ||
      b.medals[2].length - a.medals[2].length
  );
}
