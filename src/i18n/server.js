import { I18n } from 'i18n-js';
import fs from 'fs/promises';

export const SUPPORTED_LOCALES = ['pl', 'en']
export const DEFAULT_LOCALE = 'pl';

export function getRawTranslations(locale) {
  return fs.readFile(`./src/i18n/${locale}.json`, 'utf-8');
}

export async function getTranslations(locale) {
  const i18n = new I18n();
  const translations = await import(`./${locale}.json`, {
    assert: {
      type: 'json'
    }
  });

  i18n.locale = locale
  i18n.store({
    [locale]: translations
  })

  return i18n.t.bind(i18n);
}
