import { getTranslator } from '@/i18n/translator';

export function getStageName(stage, translations) {
  if (stage.name) {
    return stage.name[translations.locale];
  }

  const t = getTranslator(translations);

  switch (stage.type) {
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
