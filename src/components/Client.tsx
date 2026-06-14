'use client';

import type { EventConfig } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { GamePopover } from '@/components/GamePopover';
import { GameViewer } from '@/components/viewer/GameViewer';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type ClientProps = {
  event: EventConfig;
  locale: Locale;
};

export function Client({ locale, event }: ClientProps) {
  const { data: translations } = useTranslationsData(event.basePath, locale);

  if (!translations) {
    return null;
  }

  return (
    <>
      <GamePopover translations={translations} basePath={event.basePath} showCountry={event.showCountry} />
      <GameViewer translations={translations} basePath={event.basePath} showCountry={event.showCountry} />
    </>
  );
}
