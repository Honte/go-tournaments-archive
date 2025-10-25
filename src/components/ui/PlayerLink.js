import Link from 'next/link';

export function PlayerLink({
  player,
  translations,
  children = player.rank ? `${player.name} (${player.rank})` : player.name,
}) {
  return (
    <Link
      href={`/${translations.locale}/stats/${player.id}`}
      className="underline underline-offset-2 hover:text-pgc-hover"
    >
      {children}
    </Link>
  );
}
