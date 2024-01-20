import { ExternalLink } from '@/components/externalLink';
import { Details } from '@/components/details';
import { getTranslator } from '@/i18n/translator';

export function TournamentDetails({ tournament, translations }) {
  const t = getTranslator(translations)
  const details = {};

  if (tournament.location) {
    details[t('details.location')] = tournament.location
  }

  if (tournament.start) {
    details[t('details.start')] = formatDate(tournament.start, translations.locale)
  }

  if (tournament.end) {
    details[t('details.end')] = formatDate(tournament.end, translations.locale)
  }

  if (tournament.website) {
    details[t('details.website')] = <ExternalLink title={t('details.goToWebsite', tournament.year)} url={tournament.website}/>
  }

  if (tournament.referee) {
    details[t('details.referee')] = tournament.referee
  }

  return (
    <div className="flex-1">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('details.header')}</h2>
      <Details details={details}/>
    </div>
  );
}

function formatDate(date, locale) {
  return new Date(date).toLocaleDateString(locale, {
    day: date.length > 7 ? 'numeric' : undefined,
    month: 'long',
    year: 'numeric'
  })
}
