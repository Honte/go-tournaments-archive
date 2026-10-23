import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { DEFAULT_GAME_RECORDS_STATE, serializeGameRecordsState } from '@/libs/gameRecords';
import { allGameStatsUrl } from '@/libs/urls';
import { GamesIcon } from '@/components/home/ArchiveStatsIcons';
import { MedalCard, type MedalCardData } from '@/components/stats/MedalCard';
import { Button } from '@/components/ui/Button';

type AchievementsProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
  category?: string;
};

export function Achievements({ event, player, translations, category }: AchievementsProps) {
  const t = getTranslator(translations);
  const { toCount } = getFormatter(translations.locale);

  const cards = getPlayerMedalCards(player, event.categories);

  const metrics = [{ label: t('table.events'), value: player.totalAttended }];

  if (event.showBestPlace && !cards.length) {
    metrics.push({ label: t('table.bestPlace'), value: player.bestPlace });
  }

  metrics.push(
    { label: t('table.games'), value: player.totalGames },
    { label: t('table.won'), value: player.totalWon }
  );

  if (player.totalDrawn > 0) {
    metrics.push({ label: t('table.drawn'), value: player.totalDrawn });
  }

  if (player.totalUnresolved > 0) {
    metrics.push({ label: t('table.unresolved'), value: player.totalUnresolved });
  }

  const query = serializeGameRecordsState({ ...DEFAULT_GAME_RECORDS_STATE, player: player.id, category });

  return (
    <section className="flex flex-col gap-4">
      {cards.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:justify-center md:*:w-[calc((100%-2rem)/3)]">
          {cards.map((card) => (
            <MedalCard key={card.medal} card={card} event={event} translations={translations} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center md:mx-4 gap-x-8 gap-y-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-4">
          {metrics.map(({ label, value }) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-sm text-archive-text-muted">{label}</dt>
              <dd className="text-2xl">{toCount(value)}</dd>
            </div>
          ))}
        </dl>
        {event.generateSgfs && player.totalSgfs > 0 && (
          <Button
            href={`${allGameStatsUrl(event, translations.locale)}?${query}`}
            icon={<GamesIcon />}
            className={`
            sm:ml-auto p-3
            bg-archive-accent-fill text-archive-accent-text
            hover:bg-archive-accent-fill-hover hover:text-archive-accent-text
          `}
          >
            {t('stats.viewGameRecords', toCount(player.totalSgfs))}
          </Button>
        )}
      </div>
    </section>
  );
}

function getPlayerMedalCards(player: PlayerStats, categories: readonly string[] = []): MedalCardData[] {
  const cards: MedalCardData[] = [];
  const medals = ['gold', 'silver', 'bronze'] as const;
  const awards = ['first', 'second', 'third'] as const;

  for (const [index, medal] of medals.entries()) {
    const groups: MedalCardData['groups'] = [];
    let count = 0;

    for (const category of categories.length ? categories : [undefined]) {
      const years = category ? player.categoriesMedals[category]?.[index] : player.medals[index];

      if (years?.length) {
        groups.push({
          category,
          years: years.toSorted((a, b) => b.localeCompare(a, undefined, { numeric: true })),
        });
        count += years.length;
      }
    }

    if (count) {
      cards.push({ medal, award: awards[index], count, groups });
    }
  }

  return cards;
}
