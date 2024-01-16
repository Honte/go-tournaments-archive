import { loadTournaments } from './load'

const tournaments = await loadTournaments();

export function getTournaments() {
  return tournaments
}

export function getStats() {
  const winners = {};
  const attendants = {}
  let games = 0;
  let sgfs = 0

  for (const tournament of tournaments) {
    const { players, top, stages } = tournament;

    for (const [index, winner] of top.entries()) {
      for (const id of winner.split(',')) {
        const name = players[id].name

        winners[name] ||= { name, medals: [0,0,0] };
        winners[name].medals[index]++;
      }
    }

    for (const id in players) {
      const { name } = players[id];

      attendants[name] ||= { name, attended: [] };
      attendants[name].attended.push(tournament.year)
    }

    for (const stage of stages) {
      if (stage.rounds) {
        for (const round of stage.rounds) {
          for (const game of round) {
            games++;
            if (game.props?.sgf) {
              sgfs++;
            }
          }
        }
      }
      if (stage.games) {
        for (const game of stage.games) {
          games++;
          if (game.props?.sgf) {
            sgfs++;
          }
        }
      }
    }
  }

  for (const name in winners) {
    const player = winners[name];
    const [gold, silver, bronze] = player.medals;

    player.score = gold * 10_000 + silver * 100 + bronze
  }

  return {
    tournaments: tournaments.length,
    games,
    sgfs,
    winners: Object.values(winners).sort((a, b) => b.score - a.score),
    attendants: Object.values(attendants).sort((a, b) => b.attended.length - a.attended.length)
  }

}
