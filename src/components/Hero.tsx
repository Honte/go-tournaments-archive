import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { ArchiveSearch } from '@/components/navigation/ArchiveSearch';
import { ThemeLogo } from '@/components/ui/ThemeLogo';

type HeroProps = {
  event: EventContext;
  translations: Translations;
};

export function Hero({ event, translations }: HeroProps) {
  const t = getTranslator(translations);

  return (
    <section className="relative isolate z-10">
      <div
        className="absolute inset-y-0 right-0 hidden w-2/3 opacity-45 md:block"
        style={{
          background: 'radial-gradient(circle at 72% 46%, var(--color-archive-accent-soft), transparent 62%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-4 right-0 hidden w-3/5 opacity-45 md:block"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-archive-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-archive-border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at 72% 48%, black 0%, transparent 72%)',
        }}
        aria-hidden="true"
      />
      <span
        className="absolute right-[8%] top-[16%] hidden size-24 rounded-full border border-archive-stone-stroke-black bg-archive-stone-black shadow-xl md:block"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-[12%] right-[30%] hidden size-20 rounded-full border border-archive-stone-stroke-white bg-archive-stone-white shadow-xl md:block"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-[22%] right-[13%] hidden size-12 rounded-full border border-archive-stone-stroke-black bg-archive-stone-black shadow-lg md:block"
        aria-hidden="true"
      />

      <div className="relative flex min-h-72 max-w-3xl flex-col items-start justify-center py-8 md:min-h-80 md:py-10">
        <ThemeLogo event={event} className="mb-5 h-20 max-w-64 object-contain object-left md:h-24" />
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">{t('site.name')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-archive-text-muted md:text-lg">
          {t('site.description')}
        </p>
        <ArchiveSearch event={event} translations={translations} variant="hero" />
      </div>
    </section>
  );
}
