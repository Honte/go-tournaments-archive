import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { FaMedal } from 'react-icons/fa6';
import type { StatsMedals } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Link } from '@/components/navigation/Link';

export type MedalTableProps<T> = {
  translations: Translations;
  results: (T & { medals: StatsMedals })[];
  toKey: (result: T) => string;
  toName: (result: T) => ReactNode;
  toHref?: (result: T) => string;
  toLinkLabel?: (result: T) => string;
  nameHeader?: ReactNode;
};

export function MedalTable<T>({
  results,
  translations,
  toKey,
  toName,
  toHref,
  toLinkLabel,
  nameHeader,
}: MedalTableProps<T>) {
  const t = getTranslator(translations);

  return (
    <table className="w-full table-fixed text-center">
      <colgroup>
        <col />
        <col className="w-8" />
        <col className="w-8" />
        <col className="w-8" />
      </colgroup>
      <thead className="border-b border-archive-border">
        <tr className="h-9 text-lg">
          <th className="px-1 text-left text-xs font-semibold text-archive-text-muted">
            {nameHeader ?? t('table.player')}
          </th>
          <th className="px-0.5">
            <FaMedal className="inline" fill="#fece43" title={t('medals.gold')} />
          </th>
          <th className="px-0.5">
            <FaMedal className="inline" fill="silver" title={t('medals.silver')} />
          </th>
          <th className="px-0.5">
            <FaMedal className="inline" fill="#CD7F32" title={t('medals.bronze')} />
          </th>
        </tr>
      </thead>
      <tbody>
        {results.map((winner) => {
          const href = toHref?.(winner);

          return (
            <tr
              key={toKey(winner)}
              className={clsx('group relative h-9 even:bg-archive-row-stripe-subtle hover:bg-archive-row-hover')}
            >
              <td className="px-1 py-1.5 text-left">
                {href && (
                  <Link
                    href={href}
                    aria-label={toLinkLabel?.(winner)}
                    className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-archive-accent"
                  />
                )}
                <span
                  className={clsx(href && 'pointer-events-none relative z-20 group-hover:text-archive-accent-hover')}
                >
                  {toName(winner)}
                </span>
              </td>
              <td className="px-0.5 tabular-nums">{winner.medals[0].length}</td>
              <td className="px-0.5 tabular-nums">{winner.medals[1].length}</td>
              <td className="px-0.5 tabular-nums">{winner.medals[2].length}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
