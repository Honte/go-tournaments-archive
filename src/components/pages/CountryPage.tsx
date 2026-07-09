import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getCountryAvailableCategories } from '@/libs/countryStats';
import { getAllCountriesStats, getCountryStats, getTranslations } from '@/data/serverApi';
import { CountryStats } from '@/components/CountryStats';
import { CountryStatsNavigation } from '@/components/stats/CountryStatsNavigation';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type CountryPageProps = {
  event: EventContext;
  locale: Locale;
  code: string;
  category?: string;
};

export async function CountryPage({ event, locale, code, category }: CountryPageProps) {
  if (!event.showCountry) {
    return notFound();
  }

  if (category && !event.categories?.includes(category)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const country = await getCountryStats(event, code.toUpperCase());

  if (!country) {
    return notFound();
  }

  const t = getTranslator(translations);
  const name = t(`country.${country.code.toUpperCase()}`);
  const categories = getCountryAvailableCategories(country, event.categories ?? []);

  if (category && !categories.includes(category)) {
    return notFound();
  }

  return (
    <Content>
      <Title>{name}</Title>
      {categories.length > 0 && (
        <CountryStatsNavigation
          event={event}
          code={country.code}
          locale={locale}
          category={category}
          categories={categories}
          translations={translations}
        />
      )}
      <CountryStats event={event} code={country.code} locale={locale} category={category} />
    </Content>
  );
}

export async function getCountryPageMetadata({ event, locale, code, category }: CountryPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);
  const title = category ? `${name} - ${t(`categories.full.${category}`)}` : name;

  return {
    title: title ? `${t('site.countryStatsTitle', title)} - ${t('site.name')}` : t('site.name'),
    description: title ? t('site.countryStatsDescription', title) : t('site.description'),
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

export async function getCountryCategoryPageOptions(event: EventContext) {
  const countries = await getAllCountriesStats(event);
  const pages: { locale: Locale; code: string; category: string }[] = [];

  for (const country of Object.values(countries)) {
    for (const category of getCountryAvailableCategories(country, event.categories ?? [])) {
      for (const locale of event.locales) {
        pages.push({
          locale,
          code: country.code.toLowerCase(),
          category,
        });
      }
    }
  }

  if (!pages.length) {
    pages.push({
      locale: event.locales[0],
      code: 'none',
      category: 'none',
    });
  }

  return pages;
}
