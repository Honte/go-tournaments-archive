'use client';

import type { Translations } from '@/i18n/consts';
import { GamePopover } from '@/components/GamePopover';

type ClientProps = {
  rawTranslations: string;
};

export function Client({ rawTranslations }: ClientProps) {
  return <GamePopover translations={JSON.parse(rawTranslations) as Translations} />;
}
