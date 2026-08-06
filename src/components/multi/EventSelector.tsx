'use client';

import type { Locale, LocalizedString } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { EventGroup } from '@/components/multi/EventGroup';
import type { EventEntryGroup } from '@/components/multi/schema';
import { Link } from '@/components/navigation/Link';
import { useNavigationSearchParams } from '@/hooks/useNavigation';

type EventSelectorProps = {
  title?: LocalizedString;
  groups: EventEntryGroup[];
  locales?: Locale[];
  hasSingleLocale?: boolean;
};

export function EventSelector({ title, groups, locales, hasSingleLocale }: EventSelectorProps) {
  const params = useNavigationSearchParams();
  const locale = (params.get('locale') ?? locales?.[0] ?? 'en') as Locale;

  return (
    <>
      {locales?.length && locales.length > 1 && (
        <div className="flex gap-3 text-sm ml-auto">
          {locales.map((nextLocale) => (
            <Link
              key={nextLocale}
              className={nextLocale === locale ? 'font-bold' : 'underline'}
              href={`/?locale=${nextLocale}`}
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
        <EventGroup
          key={index}
          title={group.title}
          events={group.events}
          locale={locale}
          hasSingleLocale={hasSingleLocale}
        />
      ))}
    </>
  );
}
