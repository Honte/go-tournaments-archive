import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { HeroBackground } from '@/components/home/HeroBackground';
import { HeroSearch } from '@/components/search/HeroSearch';
import { ThemeLogo } from '@/components/ui/ThemeLogo';

type HeroProps = {
  event: EventContext;
  translations: Translations;
};

export function Hero({ event, translations }: HeroProps) {
  const t = getTranslator(translations);

  return (
    <section className="relative isolate z-10">
      <HeroBackground eventId={event.id} />
      <div className="relative flex min-h-72 max-w-3xl flex-col items-start justify-center py-8 md:min-h-80 md:py-10">
        <ThemeLogo event={event} className="mb-2 h-20 max-w-64 object-contain object-left md:h-24" />
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">{t('site.name')}</h1>
        <HeroSearch event={event} translations={translations} />
      </div>
    </section>
  );
}
