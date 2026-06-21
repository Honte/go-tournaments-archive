import type { Locale, LocalizedString } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { Markdown } from '@/components/ui/Markdown';

type TournamentDescriptionProps = {
  description?: LocalizedString;
  locale: Locale;
};

export function TournamentDescription({ description, locale }: TournamentDescriptionProps) {
  const content = getString(description, locale);

  if (!content) {
    return null;
  }

  return (
    <section className="my-4">
      <Markdown content={content} />
    </section>
  );
}
