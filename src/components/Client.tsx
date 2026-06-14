'use client';

import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { GamePopover } from '@/components/GamePopover';
import { GameViewer } from '@/components/viewer/GameViewer';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type ClientProps = {
  event: EventContext;
  locale: Locale;
};

export function Client({ locale, event }: ClientProps) {
  const { data: translations } = useTranslationsData(event, locale);

  if (!translations) {
    return null;
  }

  return (
    <>
      <GamePopover event={event} translations={translations} />
      <GameViewer event={event} translations={translations} />
    </>
  );
}
