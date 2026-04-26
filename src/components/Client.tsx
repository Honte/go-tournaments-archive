'use client';

import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/consts';
import { fetchTranslations } from '@/data/api';
import { GamePopover } from '@/components/GamePopover';

type ClientProps = {
  locale: Locale;
};

export function Client({ locale }: ClientProps) {
  const { data: translations } = useQuery({
    queryKey: ['i18n', locale],
    queryFn: () => fetchTranslations(locale),
  });

  if (!translations) {
    return null;
  }

  return <GamePopover translations={translations} />;
}
