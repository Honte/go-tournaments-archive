import type { StatsSummary } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { H1 } from '@/components/ui/H1';

type TotalStatsProps = {
  translations: Translations;
  stats: StatsSummary;
};

export function TotalStats({ translations, stats }: TotalStatsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1>{t('stats.total.title')}</H1>
      <div className="items-center">
        <ul className="list-disc mx-8">
          <li>
            {t('stats.total.tournaments')} - {stats.tournaments}
          </li>
          <li>
            {t('stats.total.participants')} - {stats.players}
          </li>
          <li>
            {t('stats.total.games')} - {stats.playedGames}
          </li>
          <li>
            {t('stats.total.black')} - {(stats.black * 100).toFixed(2)}%
          </li>
          <li>
            {t('stats.total.resigned')} - {stats.resign}
          </li>
          <li>
            {t('stats.total.timeout')} - {stats.timeout}
          </li>
          <li>
            {t('stats.total.sgfs')} - {stats.sgfs}
          </li>
          <li>
            {t('stats.total.relays')} - {stats.relays}
          </li>
          <li>
            {t('stats.total.analysis')} - {stats.analysis}
          </li>
          <li>
            {t('stats.total.streams')} - {stats.streams}
          </li>
        </ul>
      </div>
    </div>
  );
}
