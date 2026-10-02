import type { Participant, Player } from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import { type H9Member, type H9Player, normalizeCountryCode, normalizeRank } from '@/libs/h9';
import { createPair, validatePairs } from '@/libs/participants';
import type { PlayersHandler } from '@/data/players';

export function loadParticipants(
  json: Record<string, string> | undefined,
  event: EventDefinition,
  handler: PlayersHandler
): Record<string, Participant> {
  if (!event.pairs) {
    return handler.loadJson(json);
  }

  const participants: Record<string, Participant> = {};

  for (const [id, value] of Object.entries(json ?? {})) {
    participants[id] = loadPair(value, event, handler);
  }

  validatePairs(participants);

  return participants;
}

export function loadH9Participant(row: H9Player, event: EventDefinition, handler: PlayersHandler): Participant {
  if (!row.members) {
    return handler.loadPlayer({
      name: `${row.name} ${row.surname}`,
      country: row.country,
      rank: knownRank(row.rank, event),
      egd: row.egd,
    });
  }

  const [first, second] = row.members;
  return createPair(
    [loadH9Member(first, event, handler), loadH9Member(second, event, handler)],
    knownRank(row.rank, event),
    row.country
  );
}

export function loadPair(value: string, event: EventDefinition, handler: PlayersHandler) {
  const parts = value.split(';');
  const names = parts[0].split('+').map((name) => name.trim());
  const details = parts[1]?.trim().match(/^(\d{1,2}[dkp])\s+\(((?:[a-z]{2}){1,2})\)$/i);

  if (parts.length !== 2 || names.length !== 2 || !details) {
    throw new Error(`Invalid pair: ${value}. Expected "player + player; rank (country)"`);
  }

  const country = normalizeCountryCode(details[2])!;

  return createPair(
    [
      loadPairMember(names[0], country.slice(0, 2), event, handler),
      loadPairMember(names[1], country.slice(-2), event, handler),
    ],
    knownRank(normalizeRank(details[1]), event),
    country.slice(0, 2) === country.slice(-2) ? country.slice(0, 2) : 'XX'
  );
}

function loadH9Member(member: H9Member, event: EventDefinition, handler: PlayersHandler): Player {
  return handler.loadPlayer({
    name: [member.name, member.surname].filter(Boolean).join(' '),
    rank: knownRank(member.rank, event),
    country: member.country,
    egd: member.egd,
  });
}

function loadPairMember(
  name: string,
  country: string | undefined,
  event: EventDefinition,
  handler: PlayersHandler
): Player {
  const player = handler.loadPlayer(name);

  return { ...player, country: player.country ?? country, rank: knownRank(player.rank, event) };
}

function knownRank(rank: string | undefined, event: EventDefinition) {
  return rank && event.unknownRanks?.includes(rank) ? undefined : rank;
}
