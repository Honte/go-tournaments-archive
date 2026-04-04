import type { Tournament } from '@/schema/data';
import Link from 'next/link';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';

type WinnersProps = {
  tournaments: Tournament[];
  translations: Translations;
  className?: string;
};

export function Winners({ tournaments, translations, className }: WinnersProps) {
  const t = getTranslator(translations);

  return (
    <div className={className}>
      <H1>{t('winners.title')}</H1>
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
          {tournaments.map(({ year, top, players }) => (
            <tr key={year} className="text-center even:bg-gray-200 hover:bg-gray-300">
              <td className="p-2">
                <Link
                  className="sm:text-xl font-bold text-event-primary underline hover:text-event-hover"
                  href={`/${translations.locale}/${year}`}
                >
                  {year}
                </Link>
              </td>
              {top.map((winner, index) => (
                <td className="p-1" key={index}>
                  {jsxJoin(
                    winner
                      .split(',')
                      .map((id) => <PlayerLink key={id} player={players[id]} translations={translations} />),
                    ', '
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
