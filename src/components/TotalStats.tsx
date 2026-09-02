import type { IconBaseProps, IconType } from 'react-icons';
import {
  LuArrowRight,
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
import { getTranslator } from '@/i18n/translator';
import { DEFAULT_GAME_RECORDS_STATE, serializeGameRecordsState, type GameRecordsState } from '@/libs/gameRecords';
import { allGameStatsUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { H1 } from '@/components/ui/H1';

type TotalStatsProps = {
  event: EventContext;
  translations: Translations;
  stats: StatsSummary;
};

type GameDetail = {
  href: string;
  icon: IconType;
  label: string;
  value: number;
  formattedValue?: string;
  progress?: number;
  title?: string;
};

export function TotalStats({ event, translations, stats }: TotalStatsProps) {
  const t = getTranslator(translations);
  const number = new Intl.NumberFormat(translations.locale);
  const percent = new Intl.NumberFormat(translations.locale, { style: 'percent', maximumFractionDigits: 1 });
  const gameRecordsUrl = allGameStatsUrl(event, translations.locale);
  const sgfShare = ratio(stats.sgfs, stats.playedGames);
  const blackShare = ratio(stats.black, stats.color);
  const gameDetails: GameDetail[] = [
    {
      href: gameRecordsUrl,
      icon: LuFileText,
      label: t('stats.total.sgfs'),
      value: stats.sgfs,
      formattedValue: `${number.format(stats.sgfs)} · ${percent.format(sgfShare)}`,
      progress: sgfShare,
    },
    {
      href: filteredGameRecordsUrl(gameRecordsUrl, { winner: 'black' }),
      icon: BlackWinsIcon,
      label: t('stats.total.black'),
      value: stats.black,
      formattedValue: percent.format(blackShare),
      progress: blackShare,
      title: t('stats.total.blackSample', number.format(stats.color)),
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
          number={number}
        />
        <PrimaryStat icon={LuUsersRound} label={t('stats.total.participants')} value={stats.players} number={number} />
        <PrimaryStat icon={GamesIcon} label={t('stats.total.games')} value={stats.playedGames} number={number} />
      </div>

      {gameDetails.length > 0 && (
        <div className="mt-3 grid gap-1 md:grid-cols-2 xl:grid-cols-1">
          {gameDetails.map((detail) => (
            <GameDetailLink key={detail.label} detail={detail} number={number} />
          ))}
        </div>
      )}
    </section>
  );
}

function PrimaryStat({ icon, label, value, number }: Omit<GameDetail, 'href'> & { number: Intl.NumberFormat }) {
  return (
    <article className="flex min-w-0 items-center gap-2 p-1">
      <StatIcon icon={icon} prominent />
      <div className="min-w-0 flex flex-col">
        <strong className="block text-xl leading-none tabular-nums sm:text-2xl">{number.format(value)}</strong>
        <h2 className="mt-0.5 text-xs leading-tight font-semibold text-archive-text-muted sm:text-sm sm:leading-none">
          {label}
        </h2>
      </div>
    </article>
  );
}

function GameDetailLink({ detail, number }: { detail: GameDetail; number: Intl.NumberFormat }) {
  const Icon = detail.icon;
  const percentage = detail.progress === undefined ? undefined : Math.round(detail.progress * 1000) / 10;

  return (
    <Link
      href={detail.href}
      title={detail.title}
      className="group min-w-0 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-archive-accent-soft/40"
    >
      <span className="grid min-h-6 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-archive-accent text-archive-accent-text">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 text-sm leading-6 text-archive-text-muted">{detail.label}</span>
        <strong className="text-right text-sm leading-6 whitespace-nowrap tabular-nums">
          {detail.formattedValue ?? number.format(detail.value)}
        </strong>
        <LuArrowRight
          className="size-3.5 shrink-0 text-archive-text-muted transition-colors group-hover:text-archive-accent"
          aria-hidden="true"
        />
      </span>
      {percentage !== undefined && (
        <span
          className="mt-1.5 block h-1 overflow-hidden rounded-full bg-archive-surface-muted"
          role="progressbar"
          aria-label={detail.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span className="block h-full rounded-full bg-archive-accent" style={{ width: `${percentage}%` }} />
        </span>
      )}
    </Link>
  );
}

function StatIcon({ icon: Icon, prominent = false }: { icon: IconType; prominent?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl bg-archive-accent text-archive-accent-text shadow-sm ${prominent ? 'size-11' : 'size-10'}`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

function filteredGameRecordsUrl(baseUrl: string, filters: Partial<GameRecordsState>) {
  const params = serializeGameRecordsState({ ...DEFAULT_GAME_RECORDS_STATE, ...filters });
  return `${baseUrl}?${params.toString()}`;
}

function ratio(part: number, total: number) {
  return total ? Math.min(Math.max(part / total, 0), 1) : 0;
}

function GamesIcon({ size = '1em', title, ...props }: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <BoardGrid />
      <WhiteStone cx={7.5} cy={7.5} />
      <BlackStone cx={16.5} cy={7.5} />
      <BlackStone cx={7.5} cy={16.5} />
      <WhiteStone cx={16.5} cy={16.5} />
    </svg>
  );
}

function BlackWinsIcon({ size = '1em', title, ...props }: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <BoardGrid />
      <BlackStone cx={7.5} cy={7.5} />
      <WhiteStone cx={16.5} cy={7.5} />
      <BlackStone cx={7.5} cy={16.5} />
      <BlackStone cx={16.5} cy={16.5} />
    </svg>
  );
}

function BoardGrid() {
  return (
    <path
      d="M0.75 7.5h22.5M0.75 16.5h22.5M7.5 0.75v22.5M16.5 0.75v22.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      opacity="0.45"
    />
  );
}

function BlackStone({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <WhiteStone cx={cx} cy={cy} />
      <circle cx={cx} cy={cy} r="2.25" fill="var(--color-archive-accent)" />
    </>
  );
}

function WhiteStone({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="4" fill="currentColor" />;
}
