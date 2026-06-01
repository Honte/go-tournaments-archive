import type { Stage } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

export function getStageName(stage: Pick<Stage, 'name' | 'type'>, translations: Translations) {
  if (typeof stage.name === 'string') {
    return stage.name;
  }

  if (stage.name && typeof stage.name === 'object') {
    return stage.name[translations.locale];
  }

  return getStageNameFromType(stage.type, translations);
}

export function getStageNameFromType(type: Stage['type'], translations: Translations) {
  const t = getTranslator(translations);

  switch (type) {
    case 'tournament':
      return t('stage.tournament');
    case 'classification':
      return t('stage.classification');
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

export function parseTop(top?: (string | string[])[]): string[][] {
  if (!top) {
    return [];
  }

  return top.map((row) => {
    if (!row) {
      return [];
    }

    if (Array.isArray(row)) {
      return row;
    }

    return row.split(',');
  });
}
