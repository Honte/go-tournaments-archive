import type { StatsSummary } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { H1 } from '@/components/ui/H1';

type TotalStatsProps = {
  translations: Translations;
  stats: StatsSummary;
};

type StatItem = {
  label: string;
  value: number;
  formattedValue?: string;
};

export function TotalStats({ translations, stats }: TotalStatsProps) {
  const t = getTranslator(translations);

  const items: StatItem[] = [
    { label: t('stats.total.tournaments'), value: stats.tournaments },
    { label: t('stats.total.participants'), value: stats.players },
    { label: t('stats.total.games'), value: stats.playedGames },
    { label: t('stats.total.black'), value: stats.black, formattedValue: `${(stats.black * 100).toFixed(2)}%` },
    { label: t('stats.total.resigned'), value: stats.resign },
    { label: t('stats.total.timeout'), value: stats.timeout },
    { label: t('stats.total.sgfs'), value: stats.sgfs },
    { label: t('stats.total.relays'), value: stats.relays },
    { label: t('stats.total.analysis'), value: stats.analysis },
    { label: t('stats.total.streams'), value: stats.streams },
  ].filter(item => item.value !== 0);

  return (
    <div>
      <H1>{t('stats.total.title')}</H1>
      <div className="items-center">
        <ul className="list-disc mx-8">
          {items.map(({ label, value, formattedValue }) => (
            <li key={label}>
              {label} - {formattedValue ?? value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
