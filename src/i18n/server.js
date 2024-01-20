export const SUPPORTED_LOCALES = ['pl', 'en']
export const DEFAULT_LOCALE = 'pl';

export async function loadTranslations(locale) {
  const translations = await import(`./${locale}.json`, {
    assert: {
      type: 'json'
    }
  });

  translations.locale = locale;

  return translations;
}
