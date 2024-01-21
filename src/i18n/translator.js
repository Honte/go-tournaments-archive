export function getTranslator(translations, options) {
  let dict = translations;

  if (options?.scope) {
    for (const step of options.scope.split('.')) {
      dict = dict?.[step];
    }
  }

  if (!dict) {
    throw new Error(`No translations${options?.scope ? ` at ${options.scope}` : ''}`);
  }

  return function translate(strings, ...params) {
    const msg = Array.isArray(strings) ? strings[0].trim() : strings;
    let translation = dict;

    for (const step of msg.split('.')) {
      translation = translation?.[step]
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

    return replace(translation, ...params)
  }
}

function replace(msg, ...params) {
  return msg.replaceAll(/%\{(\d+)}/g, (match, index) => params[index])
}
