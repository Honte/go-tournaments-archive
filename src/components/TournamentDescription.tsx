import type { Locale } from '@/i18n/consts';
import { Markdown } from '@/components/ui/Markdown';

type TournamentDescriptionProps = {
  description?: string | Record<Locale, string>;
  locale: Locale;
};

export function TournamentDescription({ description, locale }: TournamentDescriptionProps) {
  const content = description && typeof description === 'object' ? description[locale] : description;

  if (!content) {
    return null;
  }

  return (
    <section className="my-4">
      <Markdown content={content} />
    </section>
  );
}
