import fs from 'fs/promises';
export * from './consts'

export async function loadTranslations(locale) {
  const translations = JSON.parse(await fs.readFile(`./src/i18n/${locale}.json`, 'utf-8'));

  translations.locale = locale;

  return translations;
}
