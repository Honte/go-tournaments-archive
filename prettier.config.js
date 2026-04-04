export default {
  trailingComma: 'es5',
  singleQuote: true,
  semi: true,
  printWidth: 120,
  endOfLine: 'auto',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^node:(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@/i18n/(.*)$',
    '^@/libs/(.*)$',
    '^@/data/(.*)$',
    '^@/components/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
};
