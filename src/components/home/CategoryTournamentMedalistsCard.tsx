import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { categoryUrl } from '@/libs/urls';
import { MedalRows } from '@/components/home/MedalRows';
import { TournamentCardHeading } from '@/components/home/TournamentCardHeading';
import { Link } from '@/components/navigation/Link';

type CategoryTournamentMedalistsCardProps = {
  event: EventContext;
  tournament: Tournament;
  translations: Translations;
};

export function CategoryTournamentMedalistsCard({
  event,
  tournament,
  translations,
}: CategoryTournamentMedalistsCardProps) {
  const t = getTranslator(translations);
  const categories = event.categories?.filter((category) => tournament.categoriesTop?.[category]) ?? [];

  return (
    <article className="overflow-hidden rounded-xl border border-archive-border bg-archive-surface shadow-sm transition-shadow hover:shadow-md">
      <TournamentCardHeading event={event} tournament={tournament} translations={translations} />
      <div className="min-w-0 divide-y divide-archive-border">
        {categories.map((category) => (
          <section className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)]" key={category}>
            <Link
              href={categoryUrl(event, translations.locale, category)}
              className="flex items-center justify-center border-r border-archive-border bg-archive-surface-tint px-2 py-3 text-center text-xs font-bold tracking-wide text-archive-text no-underline transition-colors hover:text-archive-link-hover focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-archive-focus-ring"
              aria-label={t(`categories.full.${category}`)}
            >
              <span className="rotate-180 whitespace-nowrap [text-orientation:mixed] [writing-mode:vertical-rl]">
                {t(`categories.full.${category}`)}
              </span>
            </Link>
            <MedalRows
              event={event}
              players={tournament.players}
              top={tournament.categoriesTop?.[category] ?? []}
              translations={translations}
            />
          </section>
        ))}
      </div>
    </article>
  );
}
