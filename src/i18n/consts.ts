export type Locale = 'pl' | 'en'; // all supported locales in all events
export type Translation = string | { [key: string]: Translation };
export type Translations = { locale: Locale } & Record<string, Translation>;
export type Translator = (path: string, ...params: string[]) => string;
export type LocalizedString = string | Record<Locale, string>;
