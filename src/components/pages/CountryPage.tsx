import type { CountryStats as Stats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { CountryStats } from '@/components/CountryStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type CountryPageProps = {
  event: EventContext;
  translations: Translations;
  country: Stats;
};

export function CountryPage({ event, translations, country }: CountryPageProps) {
  const t = getTranslator(translations);
  const name = t(`country.${country.code.toUpperCase()}`);

  return (
    <Content>
      <Title>{name}</Title>
      <CountryStats event={event} code={country.code} locale={translations.locale} />
    </Content>
  );
}
