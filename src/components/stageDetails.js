import { getTranslations } from '@/i18n/server';
import { ExternalLink } from '@/components/externalLink';
import { Details } from '@/components/details';
import { Breaker } from '@/components/breaker';

export async function StageDetails({stage, locale}) {
  const t = await getTranslations(locale);
  const details = {};

  if (stage.egd) {
    details[t('stage.egd')] = <ExternalLink title={t('stage.goToEGD')} url={stage.egd}/>;
  }

  if (stage.rules) {
    details[t('stage.rules')] = stage.rules
  }

  if (stage.komi) {
    details[t('stage.komi')] = stage.komi
  }

  if (stage.time) {
    details[t('stage.time')] = stage.time
  }

  if (stage.breakers?.length) {
    details[t('stage.breakers')] = <ol className="mx-5 list-decimal">
      {stage.breakers.map((breaker) => <li key={breaker}><Breaker t={t} breaker={breaker}/></li>)}
    </ol>
  }

  return (
    <div className="my-3">
    <Details details={details}/>
    </div>
  );
}
