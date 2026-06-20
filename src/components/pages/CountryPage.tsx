import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getAllCountriesStats, getCountryStats, getTranslations } from '@/data/serverApi';
import { CountryStats } from '@/components/CountryStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type CountryPageProps = {
  event: EventContext;
  locale: Locale;
  code: string;
};

export async function CountryPage({ event, locale, code }: CountryPageProps) {
  if (!event.showCountry) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const country = await getCountryStats(event, code.toUpperCase());

  if (!country) {
    return notFound();
  }

  const t = getTranslator(translations);
  const name = t(`country.${country.code.toUpperCase()}`);

  return (
    <Content>
      <Title>{name}</Title>
      <CountryStats event={event} code={country.code} locale={locale} />
    </Content>
  );
}

export async function getCountryPageMetadata({ event, locale, code }: CountryPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return {
    title: name ? `${t('site.countryStatsTitle', name)} - ${t('site.name')}` : t('site.name'),
    description: name ? t('site.countryStatsDescription', name) : t('site.description'),
  };
}

export async function getCountryPageOptions(event: EventContext) {
  const countries = await getAllCountriesStats(event);
  const codes = Object.keys(countries);

  if (!codes.length) {
    codes.push(event.locales[0]);
  }

  return codes
    .map((code) =>
      event.locales.map((locale) => ({
        locale,
        code: code.toLowerCase(),
      }))
    )
    .flat();
}
