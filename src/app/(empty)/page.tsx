import EVENT_CONFIG from '@event/config';
import { LocaleRedirect } from '@/components/LocaleRedirect';

export default function RootPage() {
  return <LocaleRedirect locales={EVENT_CONFIG.locales} />;
}
