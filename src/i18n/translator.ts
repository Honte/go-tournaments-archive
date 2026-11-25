import { createTranslator, type IntlError, type Messages, type TranslationValues } from 'use-intl/core';
import type { Translations, Translator } from '@/i18n/consts';

const translatorCache = new WeakMap<Translations, Translator>();

export function getTranslator(translations: Translations): Translator {
  const cached = translatorCache.get(translations);

  if (cached) {
    return cached;
  }

  const translator = createTranslator({
    locale: translations.locale,
    messages: translations as Messages,
    onError: logTranslationError,
  });

  translatorCache.set(translations, translator);

  return translator;
}

export function translateOptional(t: Translator, key: string, values?: TranslationValues): string | undefined {
  if (!t.has(key) || typeof t.raw(key) !== 'string') {
    return undefined;
  }

  return t(key, values);
}

function logTranslationError(error: IntlError): void {
  console.warn(error.message);
}
