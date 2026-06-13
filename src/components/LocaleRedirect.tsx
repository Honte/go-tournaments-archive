'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/app/loading';

type LocaleRedirectProps = {
  locales: string[];
};

export function LocaleRedirect({ locales }: LocaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${pickLocale(locales)}`);
  }, [router, locales]);

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
