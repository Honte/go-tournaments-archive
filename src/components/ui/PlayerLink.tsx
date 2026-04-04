import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import type { Translations } from '@/i18n/consts';

type PlayerLinkProps = PropsWithChildren<{
  player: { id: string; name?: string; rank?: string };
  translations: Translations;
}>;

export function PlayerLink({
  player,
  translations,
  children = player.rank ? `${player.name} (${player.rank})` : player.name,
}: PlayerLinkProps) {
  return (
    <Link
      href={`/${translations.locale}/stats/${player.id}`}
      className="underline underline-offset-2 hover:text-event-hover"
    >
      {children}
    </Link>
  );
}
