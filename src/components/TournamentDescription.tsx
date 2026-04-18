import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { Markdown } from '@/components/ui/Markdown';

type TournamentDescriptionProps = {
  tournament: Tournament;
  translations: Translations;
};

export function TournamentDescription({ tournament, translations }: TournamentDescriptionProps) {
  const description =
    typeof tournament.description === 'object' ? tournament.description[translations.locale] : tournament.description;

  if (!description) {
    return null;
  }

  return (
    <section className="my-4">
      <Markdown content={description} />
    </section>
  );
}
