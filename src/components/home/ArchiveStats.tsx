import type { IconType } from 'react-icons';
import {
  LuBrainCircuit,
  LuCalendarDays,
  LuClock3,
  LuFileText,
  LuHandshake,
  LuRadio,
  LuTrophy,
  LuUsersRound,
  LuVideo,
} from 'react-icons/lu';
import type { StatsSummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { DEFAULT_GAME_RECORDS_STATE, serializeGameRecordsState, type GameRecordsState } from '@/libs/gameRecords';
import { allGameStatsUrl } from '@/libs/urls';
import { ArchiveStatLink, type GameDetail } from '@/components/home/ArchiveStatLink';
import { BlackWinsIcon, GamesIcon } from '@/components/home/ArchiveStatsIcons';
import { H1 } from '@/components/ui/H1';

type ArchiveStatsProps = {
  event: EventContext;
  translations: Translations;
  stats: StatsSummary;
};

export function ArchiveStats({ event, translations, stats }: ArchiveStatsProps) {
  const t = getTranslator(translations);
  const { toCount, toPercentage } = getFormatter(translations.locale);
  const gameRecordsUrl = allGameStatsUrl(event, translations.locale);
  const sgfShare = ratio(stats.sgfs, stats.playedGames);
  const blackShare = ratio(stats.black, stats.color);
  const gameDetails: GameDetail[] = [
    {
      href: gameRecordsUrl,
      icon: LuFileText,
      label: t('stats.total.sgfs'),
      value: stats.sgfs,
      formattedValue: `${toCount(stats.sgfs)} · ${toPercentage(sgfShare)}`,
      progress: sgfShare,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { winner: 'black' }),
      icon: BlackWinsIcon,
      label: t('stats.total.black'),
      value: stats.black,
      formattedValue: toPercentage(blackShare),
      progress: blackShare,
      title: t('stats.total.blackSample', toCount(stats.color)),
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { winner: 'jigo' }),
      icon: LuHandshake,
      label: t('stats.total.draws'),
      value: stats.draws,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { results: ['resignation'] }),
      icon: LuTrophy,
      label: t('stats.total.resigned'),
      value: stats.resign,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { results: ['time'] }),
      icon: LuClock3,
      label: t('stats.total.timeout'),
      value: stats.timeout,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['ogs'] }),
      icon: LuRadio,
      label: t('stats.total.relays'),
      value: stats.relays,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['yt'] }),
      icon: LuVideo,
      label: t('stats.total.streams'),
      value: stats.streams,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['ai'] }),
      icon: LuBrainCircuit,
      label: t('stats.total.analysis'),
      value: stats.analysis,
    },
  ].filter((item) => item.progress !== undefined || item.value !== 0);

  return (
    <section className="h-full rounded-xl border border-archive-border bg-archive-surface p-4 shadow-sm sm:p-5">
      <H1 className="mt-0 mb-2">{t('stats.total.title')}</H1>
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
        <PrimaryStat
          icon={LuCalendarDays}
          label={t('stats.total.tournaments')}
          value={stats.tournaments}
          toCount={toCount}
        />
        <PrimaryStat
          icon={LuUsersRound}
          label={t('stats.total.participants')}
          value={stats.players}
          toCount={toCount}
        />
        <PrimaryStat icon={GamesIcon} label={t('stats.total.games')} value={stats.playedGames} toCount={toCount} />
      </div>

      {gameDetails.length > 0 && (
        <div className="mt-3 grid gap-1 md:grid-cols-2 xl:grid-cols-1">
          {gameDetails.map((detail) => (
            <ArchiveStatLink key={detail.label} detail={detail} toCount={toCount} />
          ))}
        </div>
      )}
    </section>
  );
}

type PrimaryStatProps = {
  icon: IconType;
  label: string;
  value: number;
  toCount: (value: number) => string;
};

function PrimaryStat({ icon: Icon, label, value, toCount }: PrimaryStatProps) {
  return (
    <article className="flex min-w-0 items-center gap-2 p-1">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-archive-accent-fill text-archive-accent-text shadow-sm">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex flex-col">
        <strong className="block text-xl leading-none tabular-nums sm:text-2xl">{toCount(value)}</strong>
        <h2 className="mt-0.5 text-xs leading-tight font-semibold text-archive-text-muted sm:text-sm sm:leading-none">
          {label}
        </h2>
      </div>
    </article>
  );
}

function filteredGameRecordsUrl(baseUrl: string, filters: Partial<GameRecordsState>) {
  const params = serializeGameRecordsState({ ...DEFAULT_GAME_RECORDS_STATE, ...filters });
  return `${baseUrl}?${params.toString()}`;
}

function ratio(part: number, total: number) {
  return total ? Math.min(Math.max(part / total, 0), 1) : 0;
}
