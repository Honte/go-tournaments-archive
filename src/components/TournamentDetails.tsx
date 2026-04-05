import EVENT_CONFIG from '@event/config';
import type { Tournament } from '@/schema/data';
import type { ReactNode } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Details } from '@/components/Details';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H2 } from '@/components/ui/H2';

type TournamentDetailsProps = {
  tournament: Tournament;
  translations: Translations;
};

export function TournamentDetails({ tournament, translations }: TournamentDetailsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  if (tournament.location) {
    details[t('details.location')] = tournament.location;
  }

  if (tournament.country && EVENT_CONFIG.showCountry) {
    details[t('details.country')] = t(`country.${tournament.country}`);
  }

  if (tournament.start) {
    details[t('details.start')] = formatDate(tournament.start, translations.locale);
  }

  if (tournament.end) {
    details[t('details.end')] = formatDate(tournament.end, translations.locale);
  }

  if (tournament.website) {
    details[t('details.website')] = (
      <ExternalLink title={t('details.goToWebsite', String(tournament.year))} url={tournament.website} />
    );
  }

  if (tournament.referee) {
    details[t('details.referee')] = tournament.referee;
  }

  return (
    <div className="flex-1">
      <H2>{t('details.header')}</H2>
      <Details details={details} />
    </div>
  );
}

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale, {
    day: date.length > 7 ? 'numeric' : undefined,
    month: 'long',
    year: 'numeric',
  });
}
