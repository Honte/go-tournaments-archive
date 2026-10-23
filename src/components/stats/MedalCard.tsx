import { FaMedal, FaTrophy } from 'react-icons/fa6';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { YearLink } from '@/components/YearLink';

type MedalCardProps = {
  card: MedalCardData;
  event: EventContext;
  translations: Translations;
};

export type MedalCardData = {
  medal: 'gold' | 'silver' | 'bronze';
  award: 'first' | 'second' | 'third';
  count: number;
  groups: { category?: string; years: string[] }[];
};

const MEDAL_CLASSES = {
  gold: 'border-t-archive-medal-gold',
  silver: 'border-t-archive-medal-silver',
  bronze: 'border-t-archive-medal-bronze',
};

const ICON_CLASSES = {
  gold: 'text-archive-medal-gold',
  silver: 'text-archive-medal-silver',
  bronze: 'text-archive-medal-bronze',
};

export function MedalCard({ card, event, translations }: MedalCardProps) {
  const t = getTranslator(translations);
  const { toCount } = getFormatter(translations.locale);
  const Icon = card.medal === 'gold' ? FaTrophy : FaMedal;

  return (
    <article
      className={`
        rounded-lg border border-t-5 p-5
        border-archive-border bg-archive-surface ${MEDAL_CLASSES[card.medal]}
      `}
    >
      <h3 className="flex items-center gap-3 mb-4">
        <Icon className={`size-6 shrink-0 ${ICON_CLASSES[card.medal]}`} aria-hidden="true" />
        <span className="text-3xl">{toCount(card.count)}</span>
        <span>{t(`medals.${card.medal}`)}</span>
      </h3>
      <dl className="space-y-3">
        {card.groups.map((group) => (
          <div key={group.category ?? 'all'}>
            <dt className="text-sm text-archive-text-muted">
              {group.category
                ? t(`winners.${card.award}In`, t(`categories.short.${group.category}`))
                : t(`winners.${card.award}`)}
            </dt>
            <dd className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {group.years.map((year, index) => (
                <YearLink key={`${year}-${index}`} event={event} locale={translations.locale} year={year} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
