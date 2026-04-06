import type { Stats } from '@/schema/data';
import { FaMedal } from 'react-icons/fa6';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { H1 } from '@/components/ui/H1';

type CountryMedalistsProps = {
  stats: Stats;
  translations: Translations;
};

export function CountryMedalists({ stats, translations }: CountryMedalistsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.countries')}</H1>
      <table className="w-full text-center border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-xl">
            <th></th>
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
          {stats.countryMedalists.map((winner) => (
            <tr key={winner.country} className="even:bg-gray-200 hover:bg-gray-300">
              <td className="text-left p-1">{t(`country.${winner.country}`)}</td>
              <td>{winner.medals[0].length}</td>
              <td>{winner.medals[1].length}</td>
              <td>{winner.medals[2].length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
