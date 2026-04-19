import type { StatsMedals } from '@/schema/data';
import type { ReactNode } from 'react';
import { FaMedal } from 'react-icons/fa6';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

export type MedalTableProps<T> = {
  translations: Translations;
  results: (T & { medals: StatsMedals })[];
  toKey: (result: T) => string;
  toName: (result: T) => ReactNode;
};

export function MedalTable<T>({ results, translations, toKey, toName }: MedalTableProps<T>) {
  const t = getTranslator(translations);

  return (
    <table className="w-full text-center border-collapse">
      <thead className="border-b-gray-300 border-b">
        <tr className="text-xl">
          <th />
          <th className="p-1 px-2">
            <FaMedal className="inline" fill="#fece43" title={t('medals.gold')} />
          </th>
          <th className="p-1 px-2">
            <FaMedal className="inline" fill="silver" title={t('medals.silver')} />
          </th>
          <th className="p-1 px-2">
            <FaMedal className="inline" fill="#CD7F32" title={t('medals.bronze')} />
          </th>
        </tr>
      </thead>
      <tbody>
        {results.map((winner) => (
          <tr key={toKey(winner)} className="even:bg-gray-200 hover:bg-gray-300">
            <td className="text-left p-1">{toName(winner)}</td>
            <td>{winner.medals[0].length}</td>
            <td>{winner.medals[1].length}</td>
            <td>{winner.medals[2].length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
