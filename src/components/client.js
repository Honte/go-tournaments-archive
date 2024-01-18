'use client'

import { I18nProvider } from '@/i18n/client';
import { GamePopover } from '@/components/gamePopover';

export function Client({ locale, translations }) {
  return (
    <I18nProvider locale={locale} translations={translations}>
      <GamePopover locale={locale} />
    </I18nProvider>
  )
}
