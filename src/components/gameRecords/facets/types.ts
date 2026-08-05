import type { Translator } from '@/i18n/consts';
import type { GameRecordsStoreApi } from '@/libs/gameRecords';

export type GameFacetProps = {
  store: GameRecordsStoreApi;
  t: Translator;
};
