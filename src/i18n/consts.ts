export const SUPPORTED_LOCALES = ['pl', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Translation = string | { [key: string]: Translation };
export type Translations = { locale: Locale } & Record<string, Translation>;
