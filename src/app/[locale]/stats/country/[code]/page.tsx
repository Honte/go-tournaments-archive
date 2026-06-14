import EVENT_CONFIG from '@event/config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAllCountriesStats, getCountryStats } from '@/data';
import { CountryStats } from '@/components/CountryStats';
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

  const translations = await loadTranslations(EVENT_CONFIG, locale);
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

  const translations = await loadTranslations(EVENT_CONFIG, locale);
  const t = getTranslator(translations);
  const country = await getCountryStats(code.toUpperCase());
  const name = t(`country.${code.toUpperCase()}`);

  if (!country) {
    return notFound();
  }

  return (
    <Content>
      <Title>{name}</Title>
      <CountryStats
        code={code.toUpperCase()}
        locale={locale}
        basePath={EVENT_CONFIG.basePath}
        showBestPlace={EVENT_CONFIG.showBestPlace}
      />
    </Content>
  );
}

export async function generateStaticParams() {
  const countries = await getAllCountriesStats();
  const codes = Object.keys(countries);

  if (!codes.length) {
    codes.push(EVENT_CONFIG.locales[0]);
  }

  return codes
    .map((code) =>
      EVENT_CONFIG.locales.map((locale) => ({
        locale,
        code: code.toLowerCase(),
      }))
    )
    .flat();
}
