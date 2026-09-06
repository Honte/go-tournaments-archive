import type { CustomBreaker } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslation } from '@/i18n/translator';
import { getString } from '@/i18n/utils';

type BreakerProps = {
  breaker: string;
  customBreakers?: Record<string, CustomBreaker>;
  translations: Translations;
};

export function Breaker({ breaker, translations, customBreakers }: BreakerProps) {
  const customBreaker = customBreakers?.[breaker];

  const content = customBreaker
    ? getString(customBreaker.translations, translations.locale, breaker)
    : (getTranslation(translations, `breakers.${breaker}`) as string);

  const description = customBreaker
    ? getString(customBreaker.description, translations.locale)
    : (getTranslation(translations, `breakers.descriptions.${breaker}`) as string);

  if (description) {
    return (
      <abbr title={description} className="cursor-help">
        {content}
      </abbr>
    );
  }

  return content ?? breaker.charAt(0).toUpperCase() + breaker.slice(1);
}
