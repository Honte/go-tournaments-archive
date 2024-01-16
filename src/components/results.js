import { getTranslations } from '@/i18n/server';
import { Breaker } from '@/components/breaker';

export async function Results({ stage, players, locale }) {
  const t = await getTranslations(locale);
  const { breakers, table, rounds } = stage;

  const visibleBreakers = breakers.filter((breaker) => breaker !== 'direct' && breaker !== 'rank');

  return (
    <div className="w-full overflow-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="text-center">
            <th>{t('table.place')}</th>
            <th className="text-left">{t('table.name')}</th>
            <th>{t('table.rank')}</th>
            {rounds.map((round, index) => <th key={index}>{t('table.round', { round: index + 1})}</th>)}
            {visibleBreakers.map((breaker, index) => <th key={index}><Breaker t={t} breaker={breaker}/></th>)}
          </tr>
        </thead>
        <tbody>
        {table.map((player) => (
          <tr key={player.id} className="text-center">
            <td>{player.place}</td>
            <td className="text-left">{players[player.id].name}</td>
            <td>{players[player.id].rank}</td>
            {player.games.map((game, index) => <td key={index}>{game.index}{game.won ? '+' : '-'}</td>)}
            {visibleBreakers.map((breaker) => <td key={breaker}>{player[breaker]}</td>)}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
