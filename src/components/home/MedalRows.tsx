import { FaMedal } from 'react-icons/fa6';
import type { Participant, Player } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { isPair } from '@/libs/participants';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

const MEDALS = [
  { index: 0, color: '#fece43', label: 'winners.first' },
  { index: 1, color: '#c0c0c0', label: 'winners.second' },
  { index: 2, color: '#CD7F32', label: 'winners.third' },
] as const;

type MedalRowsProps = {
  event: EventContext;
  players: Record<string, Participant>;
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
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {top[index]?.length ? (
              top[index].map((id) => {
                const player = players[id];

                return isPair(player) ? (
                  <div
                    key={id}
                    className="group flex items-center -m-1 p-1 rounded-xl hover:bg-archive-row-stripe-subtle"
                  >
                    <div className="flex flex-col flex-1">
                      {player.members.map((member) => (
                        <Player
                          key={member.id}
                          event={event}
                          player={member}
                          locale={translations.locale}
                          showRank={false}
                        />
                      ))}
                    </div>
                    {player.rank && <div className="ml-auto p-1">{player.rank}</div>}
                  </div>
                ) : (
                  <Player key={id} event={event} player={player} locale={translations.locale} />
                );
              })
            ) : (
              <span className="px-1 py-1">-</span>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function Player({
  event,
  player,
  locale,
  showRank,
}: {
  event: EventContext;
  player: Player;
  locale: string;
  showRank?: boolean;
}) {
  return (
    <PlayerLink
      className="block min-w-0 rounded-md px-1 py-1 text-current transition-colors hover:bg-archive-surface-hover-accent hover:text-archive-link"
      event={event}
      style={{ textDecoration: 'none' }}
      playerId={player.id}
      locale={locale}
    >
      <span className="wrap-break-word hyphens-auto">
        <PlayerName player={player} showCountry={event.showCountry} showRank={showRank} />
      </span>
    </PlayerLink>
  );
}
