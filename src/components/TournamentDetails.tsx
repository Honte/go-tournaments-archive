import EVENT_CONFIG from '@event/config';
import type { Tournament } from '@/schema/data';
import type { ReactNode } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { formatDate } from '@/libs/dates';
import { Details } from '@/components/Details';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H2 } from '@/components/ui/H2';
import { Markdown } from '@/components/ui/Markdown';

type TournamentDetailsProps = {
  tournament: Tournament;
  translations: Translations;
};

export function TournamentDetails({ tournament, translations }: TournamentDetailsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  if (tournament.name) {
    details[t('details.name')] =
      typeof tournament.name === 'string' ? tournament.name : tournament.name[translations.locale];
  }

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

  if (tournament.website?.length) {
    details[t('details.website')] = (
      <div className="flex flex-col">
        {(Array.isArray(tournament.website) ? tournament.website : [tournament.website]).map((website) => (
          <ExternalLink key={website} title={t('details.goToWebsite', String(tournament.year))} url={website} />
        ))}
      </div>
    );
  }

  if (tournament.notes) {
    const content = typeof tournament.notes === 'string' ? tournament.notes : tournament.notes[translations.locale];

    details[t('stage.notes')] = <Markdown content={content} inline={true} />;
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
