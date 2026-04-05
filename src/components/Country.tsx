import { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

export type CountryProps = {
  code?: string;
  translations: Translations;
};

export function Country({ code, translations }: CountryProps) {
  if (!code) {
    return null;
  }

  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return (
    <abbr title={name} className="cursor-help">
      {code.toUpperCase()}
    </abbr>
  );
}
