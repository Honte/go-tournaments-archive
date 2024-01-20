export function getTranslator(translations, scope) {
  let dict = translations;

  if (scope) {
    for (const step of scope.split('.')) {
      dict = dict?.[step];
    }
  }

  if (!dict) {
    throw new Error(`No translations${scope ? ` at ${scope}` : ''}`);
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

    if (!translation) {
      console.warn(`Missing translation: ${msg}`);
      return msg;
    }

    return replace(translation, ...params)
  }
}

function replace(msg, ...params) {
  return msg.replaceAll(/%\{(\d+)}/g, (match, index) => params[index])
}
