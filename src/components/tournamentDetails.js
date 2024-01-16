import { getTranslations } from '@/i18n/server';
import { ExternalLink } from '@/components/externalLink';
import { Details } from '@/components/details';

export async function TournamentDetails({ tournament, locale }) {
  const t = await getTranslations(locale);
  const details = {};

  if (tournament.location) {
    details[t('details.location')] = tournament.location
  }

  if (tournament.start) {
    details[t('details.start')] = formatDate(tournament.start, locale)
  }

  if (tournament.end) {
    details[t('details.end')] = formatDate(tournament.end, locale)
  }

  if (tournament.website) {
    details[t('details.website')] = <ExternalLink title={t('details.goToWebsite', { year: tournament.year })} url={tournament.website}/>
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
