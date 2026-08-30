import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { ThemeLogo } from '@/components/ui/ThemeLogo';

type HeroProps = {
  event: EventContext;
  translations: Translations;
};

export function Hero({ event, translations }: HeroProps) {
  const t = getTranslator(translations);

  return (
    <section className="flex flex-col items-center text-center py-6 gap-4">
      <ThemeLogo event={event} className="h-20 md:h-28" />
      <h1 className="text-2xl md:text-4xl font-bold">{t('site.name')}</h1>
    </section>
  );
}
