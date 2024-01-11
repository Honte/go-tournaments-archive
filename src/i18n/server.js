import { I18n } from 'i18n-js';

export const SUPPORTED_LOCALES = ['pl', 'en']
export const DEFAULT_LOCALE = 'pl';

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
