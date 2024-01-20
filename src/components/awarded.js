import { getTranslator } from '@/i18n/translator';

export function Awarded({ tournament, translations }) {
  const t = getTranslator(translations);
  const { top, players } = tournament;
  const awarded = top.map((ids) => ids.split(',').map((id) => `${players[id].name} (${players[id].rank})`).join(', '))

  return (
    <div className="flex-1">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('details.awarded')}</h2>
      <ol className="list-decimal pl-5">
        {awarded.map((players, index) => <li key={index} className="my-1">{players}</li>)}
      </ol>
    </div>
  )
}
