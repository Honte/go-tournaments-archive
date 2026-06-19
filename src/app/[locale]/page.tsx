import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { HomePage } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadDefaultEvent();

  return <HomePage event={event} locale={locale} />;
}
