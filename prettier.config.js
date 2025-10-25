export default {
  trailingComma: 'es5',
  singleQuote: true,
  semi: true,
  printWidth: 120,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^node:(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@/components/(.*)$',
    '^@/data/(.*)$',
    '^@/libs/(.*)$',
    '^@/i18n/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
};
