import { loadSingleEvent } from '@/events';
import { LocaleRedirect } from '@/components/LocaleRedirect';

export default async function RootPage() {
  const event = await loadSingleEvent();

  return <LocaleRedirect event={event} />;
}
