'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Locale, LocalizedString } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { EventGroup } from '@/components/multi/EventGroup';
import type { EventEntryGroup } from '@/components/multi/schema';

type EventSelectorProps = {
  title?: LocalizedString;
  groups: EventEntryGroup[];
  locales?: Locale[];
};

export function EventSelector({ title, groups, locales }: EventSelectorProps) {
  const locale = (useSearchParams()?.get('locale') ?? locales?.[0] ?? 'en') as Locale;

  return (
    <>
      {locales?.length && locales.length > 1 && (
        <div className="flex gap-3 text-sm ml-auto">
          {locales.map((nextLocale) => (
            <Link
              key={nextLocale}
              className={nextLocale === locale ? 'font-bold' : 'underline'}
              href={`/?locale=${nextLocale}`}
              prefetch={false}
              aria-current={nextLocale === locale ? 'true' : undefined}
            >
              {nextLocale.toUpperCase()}
            </Link>
          ))}
        </div>
      )}
      <h1 className="text-2xl md:text-4xl text-center font-bold">
        {getString(title, locale, 'Go Tournaments Archives')}
      </h1>
      {groups.map((group, index) => (
        <EventGroup key={index} title={group.title} events={group.events} locale={locale} />
      ))}
    </>
  );
}
