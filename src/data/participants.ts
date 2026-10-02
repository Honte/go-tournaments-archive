import type { Participant, Player } from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import { type H9Member, type H9Player, normalizeRank, parsePairCountry } from '@/libs/h9';
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
    return loadH9Member(row, event, handler);
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
  const details = parts[1]?.trim().match(/^(\d{1,2}[dkp])\s+\(([a-z]+)\)$/i);
  const countries = details && parsePairCountry(details[2]);

  if (parts.length !== 2 || names.length !== 2 || !details || !countries) {
    throw new Error(`Invalid pair: ${value}. Expected "player + player; rank (country)"`);
  }

  return createPair(
    [loadPairMember(names[0], countries[0], event, handler), loadPairMember(names[1], countries[1], event, handler)],
    knownRank(normalizeRank(details[1]), event),
    countries[2]
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
