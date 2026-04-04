import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

type BreakerProps = {
  breaker: string;
  translations: Translations;
};

export function Breaker({ breaker, translations }: BreakerProps) {
  const t = getTranslator(translations, { allowMissing: true });
  const content = t(`breakers.${breaker}`);
  const description = t(`breakers.descriptions.${breaker}`);

  if (description) {
    return (
      <abbr title={description} className="cursor-help">
        {content}
      </abbr>
    );
  }

  return content;
}
