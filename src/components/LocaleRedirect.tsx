'use client';

import EVENT_CONFIG from '@event/config';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import Loading from '@/app/loading';

function pickLocale(): Locale {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language ?? ''];

  for (const tag of candidates) {
    const primary = tag.split('-')[0]?.toLowerCase();

    if (isEventLocale(EVENT_CONFIG, primary)) {
      return primary;
    }
  }

  return EVENT_CONFIG.locales[0];
}

export function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${pickLocale()}`);
  }, [router]);

  return <Loading />;
}
