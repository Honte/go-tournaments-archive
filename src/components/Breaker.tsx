import type { CustomBreaker } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

type BreakerProps = {
  breaker: string;
  customBreakers?: Record<string, CustomBreaker>;
  translations: Translations;
};

export function Breaker({ breaker, translations, customBreakers }: BreakerProps) {
  const t = getTranslator(translations, { allowMissing: true });
  const customBreaker = customBreakers?.[breaker];

  const content = customBreaker
    ? (customBreaker.translations?.[translations.locale] ?? breaker)
    : t(`breakers.${breaker}`);

  const description = customBreaker
    ? customBreaker.description?.[translations.locale]
    : t(`breakers.descriptions.${breaker}`);

  if (description) {
    return (
      <abbr title={description} className="cursor-help">
        {content}
      </abbr>
    );
  }

  return content ?? breaker.charAt(0).toUpperCase() + breaker.slice(1);
}
