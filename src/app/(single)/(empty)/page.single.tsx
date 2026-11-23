import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import { LocaleRedirect } from '@/components/LocaleRedirect';
import { getEventRedirectMetadata } from '@/components/pages/HomePage';

export default async function RootPage() {
  const event = await loadSingleEvent();

  return <LocaleRedirect event={event} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return getEventRedirectMetadata(await loadSingleEvent());
}
