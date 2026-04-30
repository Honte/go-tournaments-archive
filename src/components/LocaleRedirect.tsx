'use client';

import Loading from '@/app/loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Locale } from '@/i18n/consts';
import { DEFAULT_LOCALE, isEventLocale } from '@/i18n/locales';

function pickLocale(): Locale {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language ?? ''];

  for (const tag of candidates) {
    const primary = tag.split('-')[0]?.toLowerCase();

    if (isEventLocale(primary)) {
      return primary;
    }
  }
  return DEFAULT_LOCALE;
}

export function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${pickLocale()}`);
  }, [router]);

  return <Loading />;
}
