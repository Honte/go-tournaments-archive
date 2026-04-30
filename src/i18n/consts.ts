export type Locale = 'pl' | 'en'; // all supported locales in all events
export type Translation = string | { [key: string]: Translation };
export type Translations = { locale: Locale } & Record<string, Translation>;
export type Translator = (strings: string | string[], ...params: string[]) => string;
export type OptionalTranslator = (strings: string | string[], ...params: string[]) => string | undefined;
