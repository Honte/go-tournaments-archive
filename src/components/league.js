import { Results } from '@/components/results';
import { getTranslations } from '@/i18n/server';
import { StageDetails } from '@/components/stageDetails';

export async function League({ stage, players, locale }) {
  const t = await getTranslations(locale);

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('stage.league')}</h2>
      <StageDetails stage={stage} locale={locale}/>
      <Results stage={stage} players={players} locale={locale}/>
    </div>
  );
}
