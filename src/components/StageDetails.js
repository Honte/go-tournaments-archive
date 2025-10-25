import { ExternalLink } from '@/components/ui/ExternalLink';
import { Details } from '@/components/Details';
import { Breaker } from '@/components/Breaker';
import { getTranslator } from '@/i18n/translator';

export function StageDetails({ stage, translations }) {
  const t = getTranslator(translations);
  const details = {};

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

  if (stage.breakers?.length) {
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
