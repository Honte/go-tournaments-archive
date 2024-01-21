import { getTranslator } from '@/i18n/translator';

export function Breaker({ breaker, translations }) {
  const t = getTranslator(translations, { allowMissing: true })
  const content = t(`breakers.${breaker}`)
  const description = t(`breakers.descriptions.${breaker}`);

  if (description) {
    return <abbr title={description} className="cursor-help">{content}</abbr>
  }

  return content;
}
