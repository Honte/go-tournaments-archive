import { Markdown } from '@/components/ui/Markdown';

type TournamentDescriptionProps = {
  content?: string;
};

export function TournamentDescription({ content }: TournamentDescriptionProps) {
  if (!content) {
    return null;
  }

  return (
    <section className="my-4">
      <Markdown content={content} />
    </section>
  );
}
