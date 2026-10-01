import type { Participant, PlayerStats, TableStats } from '@/schema/data';
import { getGameStats } from '@/libs/games';
import { getParticipantName, getParticipantPlayers, isPair } from '@/libs/participants';

export type RelatedPlayerRow = TableStats & {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  country: string;
  participant: Participant;
  sgfs: number;
};

export function getOpponentRows(player: PlayerStats, pairs = false): RelatedPlayerRow[] {
  const rows = new Map<string, RelatedPlayerRow>();
  const sgfs = new Map<string, Set<string>>();
  const countries = new Map<string, Set<string>>();
  for (const result of player.results) {
    for (const stage of result.stages) {
      for (const game of stage.games) {
        if (game.id === 'BYE') {
          continue;
        }
        const opponent = game.opponent ?? {
          id: game.id,
          name: player.opponents[game.id],
          country: game.country,
          rank: game.rank,
        };
        for (const participant of pairs ? [opponent] : getParticipantPlayers(opponent)) {
          const row = rows.get(participant.id) ?? createRow(participant);
          rows.set(participant.id, row);
          const represented = countries.get(row.id) ?? new Set<string>();
          if (participant.country) {
            represented.add(participant.country);
          }
          countries.set(row.id, represented);
          row.country = [...represented].join(', ');
          row.participant = { ...participant, country: row.country };
          if (!isPair(participant)) {
            row.name = player.opponents[participant.id] ?? participant.name;
            const [first, ...last] = row.name.split(' ');
            row.firstName = first;
            row.lastName = last.join(' ');
            row.participant = { ...row.participant, name: row.name };
          }
          const outcomes = getGameStats([game]);
          row.games += outcomes.games;
          row.won += outcomes.won;
          row.drawn += outcomes.drawn;
          row.unresolved += outcomes.unresolved;
          const paths = sgfs.get(row.id) ?? new Set<string>();
          if (game.props?.sgf) {
            paths.add(game.props.sgf);
          }
          sgfs.set(row.id, paths);
          row.sgfs = paths.size;
        }
      }
    }
  }
  return finishRows(rows);
}

export function getPartnerRows(player: PlayerStats): RelatedPlayerRow[] {
  const rows = new Map<string, RelatedPlayerRow>();
  const paths = new Map<string, Set<string>>();
  for (const result of player.results) {
    if (!result.partner) {
      continue;
    }
    const partner = result.partner;
    const row = rows.get(partner.id) ?? createRow(partner);
    rows.set(partner.id, row);
    row.attended++;
    row.bestPlace = Math.min(row.bestPlace, result.place);
    for (const [index, key] of (['gold', 'silver', 'bronze'] as const).entries()) {
      row[key] += player.medals[index].filter((year) => year === String(result.year)).length;
    }
    const sgfs = paths.get(partner.id) ?? new Set<string>();
    paths.set(partner.id, sgfs);
    for (const stage of result.stages) {
      const outcomes = getGameStats(stage.games);
      row.games += outcomes.games;
      row.won += outcomes.won;
      row.drawn += outcomes.drawn;
      row.unresolved += outcomes.unresolved;
      for (const game of stage.games) {
        if (game.props?.sgf) {
          sgfs.add(game.props.sgf);
        }
      }
    }
    row.sgfs = sgfs.size;
  }
  return finishRows(rows);
}

function createRow(participant: Participant): RelatedPlayerRow {
  const name = getParticipantName(participant);
  const [firstName, ...rest] = name.split(' ');
  return {
    id: participant.id,
    name,
    firstName,
    lastName: rest.join(' '),
    country: participant.country ?? '',
    participant,
    bestPlace: Infinity,
    attended: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    games: 0,
    won: 0,
    drawn: 0,
    unresolved: 0,
    lost: 0,
    wonPercent: 0,
    sgfs: 0,
  };
}

function finishRows(rows: Map<string, RelatedPlayerRow>): RelatedPlayerRow[] {
  return [...rows.values()]
    .map((row) => ({ ...row, lost: row.games - row.won - row.drawn, wonPercent: row.games ? row.won / row.games : 0 }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.id.localeCompare(b.id));
}
