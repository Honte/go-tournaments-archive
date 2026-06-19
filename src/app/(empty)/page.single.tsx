import { loadDefaultEvent } from '@/events';
import { LocaleRedirect } from '@/components/LocaleRedirect';

export default async function RootPage() {
  const event = await loadDefaultEvent();

  return <LocaleRedirect event={event} />;
}
