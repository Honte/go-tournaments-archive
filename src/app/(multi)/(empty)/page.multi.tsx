import { EventSelectorPage } from '@/components/pages/EventSelectorPage';
import { loadConfiguration } from '@/configuration';

export default async function Page() {
  const configuration = await loadConfiguration();

  return <EventSelectorPage configuration={configuration} />;
}
