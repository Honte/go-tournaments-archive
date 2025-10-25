'use client'

import { GamePopover } from '@/components/GamePopover';

export function Client({ rawTranslations }) {
  return (
    <GamePopover translations={JSON.parse(rawTranslations)} />
  )
}
