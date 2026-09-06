import type { Translation, Translations } from '@/i18n/consts';

export function getTranslator(translations: Translations) {
  return (path: string, ...params: string[]) => translate(translations, path, ...params);
}

export function translate(translations: Translations, path: string, ...params: string[]) {
  const translation = getTranslation(translations, path);

  if (typeof translation === 'object') {
    console.warn(`Translation not specific enough: ${path}`);
    return path;
  }

  if (typeof translation === 'undefined') {
    console.warn(`Missing translation: ${path}`);
    return path;
  }

  return params.length ? applyTranslationParams(translation, ...params) : translation;
}

export function getTranslation(translations: Translations, path: string): Translation | undefined {
  let translation: Translation | undefined = translations;

  for (const step of path.split('.')) {
    translation = typeof translation === 'object' ? translation[step] : undefined;
  }

  return translation;
}

export function applyTranslationParams(msg: string, ...params: string[]) {
  return msg.replaceAll(/%\{(\d+)}/g, (match, index) => params[index]);
}
