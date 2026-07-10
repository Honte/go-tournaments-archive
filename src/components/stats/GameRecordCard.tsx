'use client';

import { clsx } from 'clsx';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getStageName } from '@/libs/stage';
import { gameThumbUrl } from '@/libs/urls';
import { GameActions } from '@/components/GameActions';
import { Stone } from '@/components/Stone';
import { PlayerCell } from '@/components/ui/PlayerCell';
import { GameViewerTrigger } from '@/components/viewer/GameViewerTrigger';
import { YearLink } from '@/components/YearLink';

export type GameRecordCardProps = {
  event: EventContext;
  game: ApiGameInfo;
  translations: Translations;
};

export function GameRecordCard({ event, game, translations }: GameRecordCardProps) {
  const t = getTranslator(translations);
  const preview = game.jpg ?? game.svg ?? game.png;
  const title = `${game.black.name} vs ${game.white.name}`;
  const previewLabel = t('game.preview', title);
  const stageName = game.stageType
    ? getStageName({ name: game.stageName, type: game.stageType }, translations)
    : undefined;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-event-soft bg-white shadow-sm">
      <div className="flex min-w-0 gap-3 p-3">
        <GamePreview event={event} game={game} label={previewLabel} preview={preview} t={t} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <PlayerRow
            color="black"
            event={event}
            isWinner={game.winner === 'black'}
            label={t('table.black')}
            locale={translations.locale}
            player={game.black}
            result={game.winner === 'black' ? game.result : undefined}
            t={t}
          />
          <PlayerRow
            color="white"
            event={event}
            isWinner={game.winner === 'white'}
            label={t('table.white')}
            locale={translations.locale}
            player={game.white}
            result={game.winner === 'white' ? game.result : undefined}
            t={t}
          />
        </div>
      </div>

      <div className="border-t border-event-soft px-3 py-2 [&>div]:mt-0 [&>div]:flex-wrap">
        <GameActions event={event} props={game} t={t} showViewer={true} />
      </div>

      <footer className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-event-soft px-3 py-2 text-xs text-event-dark/70">
        <span>
          {t('game.moves')}: <strong className="text-event-dark">{game.moves}</strong>
        </span>
        {game.komi !== undefined && (
          <span>
            {t('game.komi')}: <strong className="text-event-dark">{game.komi}</strong>
          </span>
        )}
        <span className="flex items-baseline gap-1">
          {t('table.year')}:
          <YearLink event={event} locale={translations.locale} year={game.tournament} />
        </span>
        {stageName && (
          <span>
            {t('table.stage')}: <strong className="text-event-dark">{stageName}</strong>
          </span>
        )}
      </footer>
    </article>
  );
}

function GamePreview({
  event,
  game,
  label,
  preview,
  t,
}: {
  event: EventContext;
  game: ApiGameInfo;
  label: string;
  preview?: string;
  t: Translator;
}) {
  const content = preview ? (
    <img
      src={gameThumbUrl(event, preview)}
      alt=""
      className="h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
      loading="lazy"
    />
  ) : (
    <PreviewPlaceholder label={t('game.open')} />
  );

  return (
    <GameViewerTrigger
      sgfPath={game.sgf}
      aria-label={label}
      className="group flex size-24 shrink-0 items-center justify-center overflow-hidden focus-visible:ring-2 focus-visible:ring-event-primary focus-visible:ring-inset"
    >
      {content}
    </GameViewerTrigger>
  );
}

function PreviewPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-sm font-semibold text-event-dark/70">
      <span className="flex items-center" aria-hidden={true}>
        <Stone color="black" className="size-9" />
        <Stone color="white" className="-ml-2 size-9" />
      </span>
      {label}
    </div>
  );
}

function PlayerRow({
  color,
  event,
  isWinner,
  label,
  locale,
  player,
  result,
  t,
}: {
  color: 'black' | 'white';
  event: EventContext;
  isWinner: boolean;
  label: string;
  locale: string;
  player: ApiGameInfo['black'];
  result?: string;
  t: Translator;
}) {
  return (
    <div className={clsx('flex min-w-0 items-center gap-1.5', { 'font-bold': isWinner })}>
      <span className="sr-only">{label}: </span>
      <span aria-hidden={true} className="shrink-0">
        <Stone color={color} className="size-5" />
      </span>
      <div className="min-w-0">
        <PlayerCell event={event} player={player} locale={locale} showRank={true} showCountry={event.showCountry} />
      </div>
      {result && <WinnerResult result={result} t={t} />}
    </div>
  );
}

function WinnerResult({ result, t }: { result: string; t: Translator }) {
  const score = result.replace(/^[BW]\s*(?=\+)/i, '');

  if (/^\+R$/i.test(score)) {
    return (
      <abbr className="shrink-0 cursor-help" title={t('game.resign')}>
        {score}
      </abbr>
    );
  }

  if (/^\+T$/i.test(score)) {
    return (
      <abbr className="shrink-0 cursor-help" title={t('game.time')}>
        {score}
      </abbr>
    );
  }

  return (
    <span className="shrink-0" title={t('game.result')}>
      {score}
    </span>
  );
}
