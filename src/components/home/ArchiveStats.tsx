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
import { DEFAULT_GAME_RECORDS_STATE, type GameRecordsState, serializeGameRecordsState } from '@/libs/gameRecords';
import { allGameStatsUrl } from '@/libs/urls';
import { ArchiveStatLink, ArchiveStatLinkProps } from '@/components/home/ArchiveStatLink';
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
  const details: ArchiveStatLinkProps[] = [];

  if (stats.sgfs) {
    const sgfShare = ratio(stats.sgfs, stats.playedGames);

    details.push({
      href: gameRecordsUrl,
      icon: LuFileText,
      label: t('stats.total.sgfs'),
      value: `${toCount(stats.sgfs)} · ${toPercentage(sgfShare)}`,
      progress: sgfShare,
    });
  }

  if (stats.color) {
    const blackShare = ratio(stats.black, stats.color);

    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { winner: 'black' }),
      icon: BlackWinsIcon,
      label: t('stats.total.black'),
      value: toPercentage(blackShare),
      progress: blackShare,
      title: t('stats.total.blackSample', toCount(stats.color)),
    });
  }

  if (stats.draws) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { winner: 'jigo' }),
      icon: LuHandshake,
      label: t('stats.total.draws'),
      value: toCount(stats.draws),
    });
  }

  if (stats.resign) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { results: ['resignation'] }),
      icon: LuTrophy,
      label: t('stats.total.resigned'),
      value: toCount(stats.resign),
    });
  }

  if (stats.timeout) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { results: ['time'] }),
      icon: LuClock3,
      label: t('stats.total.timeout'),
      value: toCount(stats.timeout),
    });
  }

  if (stats.relays) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['ogs'] }),
      icon: LuRadio,
      label: t('stats.total.relays'),
      value: toCount(stats.relays),
    });
  }

  if (stats.streams) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['yt'] }),
      icon: LuVideo,
      label: t('stats.total.streams'),
      value: toCount(stats.streams),
    });
  }

  if (stats.analysis) {
    details.push({
      href: filteredGameRecordsUrl(gameRecordsUrl, { media: ['ai'] }),
      icon: LuBrainCircuit,
      label: t('stats.total.analysis'),
      value: toCount(stats.analysis),
    });
  }

  return (
    <section className="h-full rounded-xl border border-archive-border bg-archive-surface p-4 shadow-sm sm:p-5">
      <H1 className="mt-0 mb-2">{t('stats.total.title')}</H1>
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
        <PrimaryStat icon={LuCalendarDays} label={t('stats.total.tournaments')} value={toCount(stats.tournaments)} />
        <PrimaryStat icon={LuUsersRound} label={t('stats.total.participants')} value={toCount(stats.players)} />
        <PrimaryStat icon={GamesIcon} label={t('stats.total.games')} value={toCount(stats.playedGames)} />
      </div>

      {details.length > 0 && (
        <div className="mt-3 grid gap-1 md:grid-cols-2 xl:grid-cols-1">
          {details.map((detail) => (
            <ArchiveStatLink key={detail.label} {...detail} />
          ))}
        </div>
      )}
    </section>
  );
}

type PrimaryStatProps = {
  icon: IconType;
  label: string;
  value: string;
};

function PrimaryStat({ icon: Icon, label, value }: PrimaryStatProps) {
  return (
    <article className="flex min-w-0 items-center gap-2 p-1">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-archive-accent-fill text-archive-accent-text shadow-sm">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <strong className="block text-xl leading-none tabular-nums sm:text-2xl">{value}</strong>
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
