import { getTranslator } from '@/i18n/translator';
import { H1 } from '@/components/ui/h1';
import { PlayerLink } from '@/components/ui/playerLink';
import { FullStatsLink } from '@/components/fullStatsLink';

export function Attendants({ stats, translations }) {
  const t = getTranslator(translations)
  const players = Object.values(stats.players)
    .sort((a, b) => b.years.length - a.years.length)

  return (
    <div>
      <H1>{t('stats.attendants', 10)}</H1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {players.slice(0, 10).map((p) => <li key={p.id}><PlayerLink player={p} translations={translations}>{p.name}</PlayerLink> - {p.years.length}</li>)}
        </ol>
      </div>
      <FullStatsLink translations={translations}/>
    </div>
  )
}
