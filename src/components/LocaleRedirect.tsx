'use client';

import EVENT_CONFIG from '@event/config';
import Loading from '@/app/loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { type Locale, SUPPORTED_LOCALES } from '@/i18n/consts';

function pickLocale(): Locale {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language ?? ''];

  for (const tag of candidates) {
    const primary = tag.split('-')[0]?.toLowerCase();

    if (primary && (SUPPORTED_LOCALES as readonly string[]).includes(primary)) {
      return primary as Locale;
    }
  }
  return EVENT_CONFIG.defaultLocale;
}

export function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${pickLocale()}`);
  }, [router]);

  return <Loading />;
}
