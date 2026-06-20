'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { EventContext } from '@/schema/event';
import { homeUrl } from '@/libs/urls';
import Loading from '@/app/loading';

type LocaleRedirectProps = {
  event: EventContext;
};

export function LocaleRedirect({ event }: LocaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(homeUrl(event, pickLocale(event.locales)));
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
