'use client'

import { createContext, useContext } from 'react';
import { I18n } from 'i18n-js';

const i18n = new I18n();

export const I18nContext = createContext(i18n);

export function I18nProvider({ lang, translations, children }) {
  i18n.store({
    [lang]: JSON.parse(translations)
  })
  i18n.locale = lang

  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations() {
  return useContext(I18nContext);
}

