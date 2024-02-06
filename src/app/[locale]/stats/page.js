import { H1 } from '@/components/ui/h1';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { PlayerStats } from '@/components/playerStats';
import { getStats } from '@/data';

export async function generateMetadata({ params: { locale } }) {
  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsDescription')
  };
}

export default async function Stats({ params: { locale }}) {
  const translations = await loadTranslations(locale);
  const stats = getStats();
  const t = getTranslator(translations);

  return (
    <>
      <H1>{t('stats.allTimeHeader')}</H1>
      <PlayerStats players={stats.players} translations={translations}/>
    </>
  )
}
