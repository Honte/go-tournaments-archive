import type { Player } from '@/schema/data';
import Link from 'next/link';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

type WinnersTableProps = {
  results: { year: number; top: string[]; players: Record<string, Player> }[];
  translations: Translations;
};

const MEDALS = [0, 1, 2];

export function WinnersTable({ results, translations }: WinnersTableProps) {
  const t = getTranslator(translations);

  return (
    <table className="w-full border-collapse sm:table-fixed">
      <thead className="border-b-gray-300 border-b">
        <tr>
          <th className="sm:w-24 md:w-36">{t('winners.year')}</th>
          <th>{t('winners.first')}</th>
          <th>{t('winners.second')}</th>
          <th>{t('winners.third')}</th>
        </tr>
      </thead>
      <tbody>
        {results.map(({ year, top, players }) => (
          <tr key={year} className="text-center even:bg-gray-200 hover:bg-gray-300">
            <td className="p-2">
              <Link
                className="sm:text-xl font-bold text-event-primary underline hover:text-event-hover"
                href={`/${translations.locale}/${year}`}
                prefetch={false}
              >
                {year}
              </Link>
            </td>
            {MEDALS.map((index) => (
              <td className="p-1" key={index}>
                {top[index]
                  ? jsxJoin(
                      top[index].split(',').map((id) => (
                        <PlayerLink key={id} playerId={players[id].id} locale={translations.locale}>
                          <PlayerName player={players[id]} />
                        </PlayerLink>
                      )),
                      ', '
                    )
                  : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
