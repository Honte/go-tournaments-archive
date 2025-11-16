import { Translations, type Translator } from '@/i18n/consts';

export function getTranslator(
  translations: Translations,
  options?: { scope?: string; allowMissing?: boolean }
): Translator {
  let dict = translations;

  if (options?.scope) {
    for (const step of options.scope.split('.')) {
      dict = dict?.[step] as Translations;
    }
  }

  if (!dict) {
    throw new Error(`No translations${options?.scope ? ` at ${options.scope}` : ''}`);
  }

  return function translate(strings: string | string[], ...params: string[]) {
    const msg = Array.isArray(strings) ? strings[0].trim() : strings;
    let translation = dict;

    for (const step of msg.split('.')) {
      translation = translation?.[step] as Translations;
    }

    if (typeof translation === 'object') {
      console.warn(`Translation not specific enough: ${msg}`);
      return msg;
    }

    if (typeof translation === 'undefined') {
      if (!options?.allowMissing) {
        console.warn(`Missing translation: ${msg}`);
        return msg;
      }

      return undefined;
    }

    return replace(translation, ...params);
  };
}

function replace(msg: string, ...params: string[]) {
  return msg.replaceAll(/%\{(\d+)}/g, (match, index) => params[index]);
}
