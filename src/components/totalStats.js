import { getTranslations } from '@/i18n/server';

export async function TotalStats({ locale, stats }) {
  const t = await getTranslations(locale)

  return (
    <div>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">{t('stats.total.title')}</h1>
      <div className="items-center">
        <ul className="list-disc mx-8">
          <li>{t('stats.total.tournaments')} - {stats.tournaments}</li>
          <li>{t('stats.total.participants')} - {stats.attendants.length}</li>
          <li>{t('stats.total.games')} - {stats.games}</li>
          <li>{t('stats.total.resigned')} - {stats.resign}</li>
          <li>{t('stats.total.timeout')} - {stats.timeout}</li>
          <li>{t('stats.total.sgfs')} - {stats.sgfs}</li>
          <li>{t('stats.total.relays')} - {stats.relays}</li>
          <li>{t('stats.total.analysis')} - {stats.analysis}</li>
          <li>{t('stats.total.streams')} - {stats.streams}</li>
        </ul>
      </div>
    </div>
  )
}
