import { FullStatsLink } from '@/components/FullStatsLink';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { getTranslator } from '@/i18n/translator';

export function Attendants({ stats, translations }) {
  const t = getTranslator(translations);
  const players = Object.values(stats.players).sort((a, b) => b.years.length - a.years.length);

  return (
    <div>
      <H1>{t('stats.attendants', 10)}</H1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {players.slice(0, 10).map((p) => (
            <li key={p.id}>
              <PlayerLink player={p} translations={translations}>
                {p.name}
              </PlayerLink>{' '}
              - {p.years.length}
            </li>
          ))}
        </ol>
      </div>
      <FullStatsLink translations={translations} />
    </div>
  );
}
