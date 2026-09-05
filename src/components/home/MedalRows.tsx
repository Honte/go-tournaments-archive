import { FaMedal } from 'react-icons/fa6';
import type { Player } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

const MEDALS = [
  { index: 0, color: '#fece43', label: 'winners.first' },
  { index: 1, color: 'silver', label: 'winners.second' },
  { index: 2, color: '#CD7F32', label: 'winners.third' },
] as const;

type MedalRowsProps = {
  event: EventContext;
  players: Record<string, Player>;
  top: string[][];
  translations: Translations;
};

export function MedalRows({ event, players, top, translations }: MedalRowsProps) {
  const t = getTranslator(translations);

  return (
    <div className="min-w-0 divide-y divide-archive-border">
      {MEDALS.map(({ index, color, label }) => (
        <section className="flex min-w-0 items-start gap-2 p-3 sm:px-4" key={index}>
          <FaMedal className="mt-2 shrink-0" color={color} aria-label={t(label)} title={t(label)} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {top[index]?.length ? (
              top[index].map((id) => (
                <PlayerLink
                  key={id}
                  className="block min-w-0 rounded-md px-1 py-1 text-current transition-colors hover:bg-archive-surface-hover-accent hover:text-archive-link"
                  event={event}
                  style={{ textDecoration: 'none' }}
                  playerId={players[id].id}
                  locale={translations.locale}
                >
                  <span className="wrap-break-word hyphens-auto">
                    <PlayerName player={players[id]} showCountry={event.showCountry} />
                  </span>
                </PlayerLink>
              ))
            ) : (
              <span className="px-1 py-1">-</span>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
