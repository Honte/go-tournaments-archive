import { getTranslations } from '@/i18n/server';
import { Breaker } from '@/components/breaker';
import { GamePopoverTrigger } from '@/components/gamePopover';

export async function Results({ stage, players, games, locale }) {
  const t = await getTranslations(locale);
  const { breakers, table, rounds } = stage;

  const visibleBreakers = breakers.filter((breaker) => breaker !== 'direct' && breaker !== 'rank');

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {rounds.map((round, index) => <th className="p-1" key={index}>{t('table.round', { round: index + 1})}</th>)}
            {visibleBreakers.map((breaker, index) => <th className="p-1" key={index}><Breaker t={t} breaker={breaker}/></th>)}
          </tr>
        </thead>
        <tbody>
        {table.map((player) => (
          <tr key={player.id} className="text-center even:bg-gray-200">
            <td className="p-1">{player.place}</td>
            <td className="p-1 text-left">{players[player.id].name}</td>
            <td className="p-1">{players[player.id].rank}</td>
            {player.games.map((game, index) => game ? <GamePopoverTrigger as="td" key={index} game={games[game.game]} players={players}>{game.index}{game.won ? '+' : '-'}</GamePopoverTrigger> : <td key={index}>&ndash;</td>)}
            {visibleBreakers.map((breaker) => <td className="p-1" key={breaker}>{player[breaker]}</td>)}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
