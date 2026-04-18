import type { Stage } from '@/schema/data';
import type { ReactNode } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Breaker } from '@/components/Breaker';
import { Details } from '@/components/Details';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { Markdown } from '@/components/ui/Markdown';

type StageDetailsProps = {
  stage: Stage;
  translations: Translations;
};

export function StageDetails({ stage, translations }: StageDetailsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  if (stage.egd) {
    details[t('stage.egd')] = <ExternalLink title={t('stage.goToEGD')} url={stage.egd} />;
  }

  if (stage.rules) {
    details[t('stage.rules')] = stage.rules;
  }

  if (stage.komi) {
    details[t('stage.komi')] = stage.komi;
  }

  if (stage.time) {
    details[t('stage.time')] = stage.time;
  }

  if ('breakers' in stage && stage.breakers?.length) {
    details[t('stage.breakers')] = (
      <ol className="mx-5 list-decimal">
        {stage.breakers.map((breaker) => (
          <li key={breaker}>
            <Breaker translations={translations} breaker={breaker} />
          </li>
        ))}
      </ol>
    );
  }

  if (stage.notes) {
    const content = typeof stage.notes === 'string' ? stage.notes : stage.notes[translations.locale];

    details[t('stage.notes')] = <Markdown content={content} inline={true} />;
  }

  return (
    <>
      {Object.keys(details).length ? (
        <div className="my-3">
          <Details details={details} />
        </div>
      ) : (
        ''
      )}
    </>
  );
}
