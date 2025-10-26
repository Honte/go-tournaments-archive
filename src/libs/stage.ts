import type { Stage } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

export function getStageName(stage: Stage, translations: Translations) {
  if (stage.name) {
    return stage.name[translations.locale];
  }

  return getStageNameFromType(stage.type, translations);
}

export function getStageNameFromType(type: Stage['type'], translations: Translations) {
  const t = getTranslator(translations);

  switch (type) {
    case 'league':
    case 'round-robin-table':
      return t('stage.league');
    case 'final':
      return t('stage.final');
    case 'ladder-table':
      return t('stage.ladder');
    default:
      throw new Error('Unrecognized stage type');
  }
}
