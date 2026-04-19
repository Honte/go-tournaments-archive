import EVENT_CONFIG from '@event/config';
import { getAllCountriesStats, getCountryStats } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { SUPPORTED_LOCALES, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { CountryAchievements } from '@/components/stats/CountryAchievements';
import { CountryEvents } from '@/components/stats/CountryEvents';
import { CountryOpponents } from '@/components/stats/CountryOpponents';
import { CountryPlayers } from '@/components/stats/CountryPlayers';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type PageProps = {
  params: Promise<{
    code: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code, locale } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return {
    title: name ? `${t('site.countryStatsTitle', name)} - ${t('site.name')}` : t('site.name'),
    description: name ? t('site.countryStatsDescription', name) : t('site.description'),
  };
}

export default async function CountryStatsPage({ params }: PageProps) {
  if (!EVENT_CONFIG.showCountry) {
    return notFound();
  }

  const { locale, code } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);
  const country = await getCountryStats(code.toUpperCase());
  const name = t(`country.${code.toUpperCase()}`);

  if (!country) {
    return notFound();
  }

  return (
    <Content>
      <Title>{name}</Title>
      <div className="flex flex-col gap-2">
        <CountryAchievements country={country} translations={translations} />
        <CountryPlayers country={country} translations={translations} />
        <CountryEvents country={country} translations={translations} />
        <CountryOpponents country={country} translations={translations} />
      </div>
    </Content>
  );
}

export async function generateStaticParams() {
  const countries = await getAllCountriesStats();

  return Object.keys(countries)
    .map((code) =>
      SUPPORTED_LOCALES.map((locale) => ({
        locale,
        code: code.toLowerCase(),
      }))
    )
    .flat();
}
