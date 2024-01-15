import { Results } from '@/components/results';

export function League({ stage, players, locale }) {
  return (
    <div className="my-4">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Liga</h2>
      <Results stage={stage} players={players} locale={locale}/>
    </div>
  );
}
