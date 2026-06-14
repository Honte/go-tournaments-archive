import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { logoBlackUrl } from '@/libs/urls';

type HeroProps = {
  translations: Translations;
  basePath?: string;
};

export function Hero({ translations, basePath }: HeroProps) {
  const t = getTranslator(translations);

  return (
    <section className="flex flex-col items-center text-center py-6 gap-4">
      <img src={logoBlackUrl(basePath)} alt="" className="h-20 md:h-28" />
      <h1 className="text-2xl md:text-4xl font-bold">{t('site.name')}</h1>
    </section>
  );
}
