'use client';

import { useTranslationsData } from '@/hooks/useTranslationsData';
import type { Locale } from '@/i18n/consts';
import { GamePopover } from '@/components/GamePopover';

type ClientProps = {
  locale: Locale;
};

export function Client({ locale }: ClientProps) {
  const { data: translations } = useTranslationsData(locale);

  if (!translations) {
    return null;
  }

  return <GamePopover translations={translations} />;
}
