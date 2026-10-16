import type { Pair, Participant, Player } from '@/schema/data';

export function isPair(participant: Participant): participant is Pair {
  return 'members' in participant;
}

export function getParticipantPlayers(participant: Participant): readonly Player[] {
  return isPair(participant) ? participant.members : [participant];
}

export function getParticipantName(participant: Participant): string {
  return isPair(participant) ? participant.members.map((p) => p.name).join(' + ') : participant.name;
}

export function hasParticipantPlayer(participant: Participant, id: string): boolean {
  return isPair(participant) ? participant.members.some((p) => p.id === id) : participant.id === id;
}

export function createPair(members: [Player, Player], rank?: string, country?: string): Pair {
  if (members[0].id === members[1].id) {
    throw new Error(`A pair must contain two different players: ${members[0].name}`);
  }
  return {
    id: `pair:${JSON.stringify(members.map((player) => player.id).sort())}`,
    members,
    rank,
    country,
  };
}

export function validatePairs(participants: Record<string, Participant>): void {
  const membership = new Map<string, string>();
  for (const participant of Object.values(participants)) {
    if (!isPair(participant)) {
      throw new Error(`Expected a pair: ${participant.id}`);
    }
    for (const member of participant.members) {
      const previous = membership.get(member.id);
      if (previous && previous !== participant.id) {
        throw new Error(`Player ${member.name} belongs to multiple pairs in one edition`);
      }
      membership.set(member.id, participant.id);
    }
  }
}
