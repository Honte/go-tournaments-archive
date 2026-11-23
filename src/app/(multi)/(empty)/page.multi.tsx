import type { Metadata } from 'next';
import { EventSelectorPage, getEventSelectorPageMetadata } from '@/components/pages/EventSelectorPage';
import { loadConfiguration } from '@/configuration';

export default async function Page() {
  const configuration = await loadConfiguration();

  return <EventSelectorPage configuration={configuration} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return getEventSelectorPageMetadata(await loadConfiguration());
}
