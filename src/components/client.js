'use client'

import { GamePopover } from '@/components/gamePopover';

export function Client({ rawTranslations }) {
  return (
    <GamePopover translations={JSON.parse(rawTranslations)} />
  )
}
