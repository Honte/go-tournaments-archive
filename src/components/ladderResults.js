import { getTranslations } from '@/i18n/server';
import { GamePopoverTrigger } from '@/components/gamePopover';
import { GameCell } from '@/components/gameCell';

export async function LadderResults({ stage, players, games, locale }) {
  const t = await getTranslations(locale);
  const { table, rounds, playoffs } = stage;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {rounds.map((round, index) => <th className="p-1" key={index}>{t('table.round', { round: index + 1})}</th>)}
            {playoffs?.length ? <th className="p-1">{t('table.playoffs')}</th> : ''}
          </tr>
        </thead>
        <tbody>
        {table.map((player, i) => (
          <tr key={player.id} className="text-center even:bg-gray-200">
            <td className="p-1">{(i === 0 || player.place !== table[i - 1].place) ? player.place : ''}</td>
            <td className="p-1 text-left">{players[player.id].name}</td>
            <td className="p-1">{players[player.id].rank}</td>
            {player.games.map((game, index) => game ? <GameCell as="td" key={index} entry={game} games={games} players={players}/> : <td key={index}/>)}
            {playoffs.length ? <td className="inline-flex gap-2">
              {player.playoffs.map((game, index) => <GameCell as="span" key={index} entry={game} games={games} players={players}/>)}
            </td> : ''}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
