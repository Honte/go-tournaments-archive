'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { EventContext } from '@/schema/event';
import { navigate } from '@/libs/navigation';
import { homeUrl } from '@/libs/urls';
import Loading from '@/app/loading';

type LocaleRedirectProps = {
  event: EventContext;
};

export function LocaleRedirect({ event }: LocaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const href = homeUrl(event, pickLocale(event.locales));

    if (navigate(href, 'replace') === 'route') {
      router.replace(href);
    }
  }, [router, event]);

  return <Loading />;
}
function pickLocale(locales: string[]): string {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language ?? ''];

  for (const tag of candidates) {
    const primary = tag.split('-')[0]?.toLowerCase();

    if (locales.includes(primary)) {
      return primary;
    }
  }

  return locales[0];
}
