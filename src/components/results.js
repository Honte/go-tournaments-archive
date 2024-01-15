export function Results({ stage, players, locale }) {
  const { breakers, table, rounds } = stage;

  return (
    <div className="w-full overflow-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th>Miejsce</th>
            <th>Gracz</th>
            <th>Siła</th>
            {rounds.map((round, index) => <th key={index}>Runda {index + 1}</th>)}
            {breakers.map((breaker, index) => <th key={index}>{breaker}</th>)}
          </tr>
        </thead>
        <tbody>
        {table.map((player) => (
          <tr key={player.id}>
            <td>{player.place}</td>
            <td>{players[player.id].name}</td>
            <td>{players[player.id].rank}</td>
            {player.games.map((game) => <td key={game.opponent}>{game.opponent}{game.won ? '+' : '-'}</td>)}
            {breakers.map((breaker) => <td key={breaker}>{player[breaker]}</td>)}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
