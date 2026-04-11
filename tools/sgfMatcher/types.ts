export const UNKNOWN_PLACE = '?' as const;

export type Color = 'black' | 'white' | undefined;

export type PlayerNames = {
  blackName: string | null;
  whiteName: string | null;
};

export type SgfInfo = {
  path: string;
  metadata: PlayerNames;
  fromFilename: PlayerNames;
  rawResult: string | null;
  cleanResult: string | null;
  corrupted: boolean;
};

export type SgfPlaces = {
  blackPlace: number | null;
  whitePlace: number | null;
};

export type H9GameRecord = {
  homePlace: number;
  awayPlace: number;
  winnerPlace: number | null;
  homeColor: Color;
  winnerColor: Color;
};

export type ParsedGameEntry = {
  id: string;
  sgf: string;
  props: string;
};

export type StageResult = {
  year: number;
  matched: number;
  unmatched: number;
  totalSgfs: number;
  reused: number;
};

export type UnmatchedEntry = {
  filename: string;
  line: string;
  reasons: string[];
};

export type StageProcessResult = {
  previousEntries: string[];
  reusedEntries: string[];
  matchedEntries: string[];
  unmatchedEntries: UnmatchedEntry[];
  totalSgfs: number;
};
