import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { loadTranslations } from '@/i18n/server';
import { createZip } from '@/libs/zip';
import { getTournaments } from '@/data/serverApi';
import { loadCleanTournamentSgfs } from '@/data/sgfs';

export async function serveSgfsZip(event: EventContext, year: number) {
  const tournaments = await getTournaments(event);
  const tournament = tournaments.find((tournament) => tournament.year === year);

  if (!tournament?.hasSgfs) {
    return notFound();
  }

  const translations = await loadTranslations(event);
  const files = await loadCleanTournamentSgfs(event, tournament, translations);

  if (!files.length) {
    return notFound();
  }

  return new Response(createZip(files), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${event.id}-${year}-sgfs.zip"`,
    },
  });
}
