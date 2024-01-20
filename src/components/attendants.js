import { getTranslator } from '@/i18n/translator';

export function Attendants({ stats, translations }) {
  const t = getTranslator(translations)

  return (
    <div>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">{t('stats.attendants', 10)}</h1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {stats.attendants.slice(0, 10).map((p) => <li key={p.name}>{p.name} - {p.attended.length}</li>)}
        </ol>
      </div>
    </div>
  )
}
