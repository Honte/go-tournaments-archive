'use client';

import type { Locale, LocalizedString } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { EventGroup } from '@/components/multi/EventGroup';
import { LocaleSelector } from '@/components/multi/LocaleSelector';
import type { EventEntryGroup } from '@/components/multi/schema';
import { Markdown } from '@/components/ui/Markdown';
import { useNavigationSearchParams } from '@/hooks/useNavigation';

type EventSelectorProps = {
  title?: LocalizedString;
  footer?: LocalizedString;
  groups: EventEntryGroup[];
  locales?: Locale[];
  hasSingleLocale?: boolean;
};

export function EventSelector({ title, footer, groups, locales, hasSingleLocale }: EventSelectorProps) {
  const params = useNavigationSearchParams();
  const locale = (params.get('locale') ?? locales?.[0] ?? 'en') as Locale;
  const footerContent = getString(footer, locale);
  const selectorTitle = getString(title, locale, 'Go Tournaments Archives');

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 bg-event-dark text-event-light">
        <div className="container mx-auto flex h-12 max-w-(--breakpoint-2xl) items-center gap-3 px-4">
          <span className="min-w-0 flex-1 truncate text-base font-semibold xs:text-lg">{selectorTitle}</span>
          <LocaleSelector locale={locale} locales={locales} />
        </div>
      </header>
      <main className="container mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col gap-8 p-4">
        <header className="py-4 text-center sm:py-6">
          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight md:text-4xl">{selectorTitle}</h1>
        </header>
        {groups.map((group, index) => (
          <EventGroup
            key={index}
            title={group.title}
            events={group.events}
            locale={locale}
            hasSingleLocale={hasSingleLocale}
          />
        ))}
        {footerContent && (
          <footer className="mt-2 border-t border-event-soft px-2 pt-5 text-center text-sm text-event-dark/70 [&_p]:my-0">
            <Markdown content={footerContent} />
          </footer>
        )}
      </main>
    </>
  );
}
