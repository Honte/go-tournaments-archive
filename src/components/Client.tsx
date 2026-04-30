'use client';

import type { Locale } from '@/i18n/consts';
import { GamePopover } from '@/components/GamePopover';
import { GameViewer } from '@/components/viewer/GameViewer';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type ClientProps = {
  locale: Locale;
};

export function Client({ locale }: ClientProps) {
  const { data: translations } = useTranslationsData(locale);

  if (!translations) {
    return null;
  }

  return (
    <>
      <GamePopover translations={translations} />
      <GameViewer translations={translations} />
    </>
  );
}
