import type { Locale } from '@/i18n/consts';

export function getFormatter(locale: Locale) {
  const count = new Intl.NumberFormat(locale);
  const percentage = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });

  return {
    toCount(this: void, value: number) {
      return count.format(value);
    },

    toPercentage(this: void, value: number) {
      return percentage.format(value);
    },

    toNumericCell(this: void, { getValue }: { getValue: () => unknown }) {
      const value = Number(getValue());

      return isNaN(value) || !isFinite(value) ? '–' : count.format(value);
    },

    toPercentageCell(this: void, { getValue }: { getValue: () => unknown }) {
      const value = Number(getValue());

      return isNaN(value) || !isFinite(value) ? '–' : percentage.format(value);
    },
  };
}
