export const UNKNOWN_PLACE = '?' as const;
export type UnknownPlace = typeof UNKNOWN_PLACE;

export type Color = 'black' | 'white' | undefined;

export type SgfInfo = {
  path: string;
  sgfBlackName: string | null;
  sgfWhiteName: string | null;
  sgfRound: number | null;
  filenameBlackName: string | null;
  filenameWhiteName: string | null;
  filenameRound: number | null;
  filenameStage: string | null;
  rawResult: string | null;
  cleanResult: string | null;
  resultIssue: string | null;
  contentIssue?: string | null;
  corrupted: boolean;
};

export type SgfPlaces = {
  blackPlace: number | null;
  whitePlace: number | null;
};

export type H9GameRecord = {
  homePlace: number;
  awayPlace: number;
  round: number;
  winnerPlace: number | null;
  homeColor: Color;
  winnerColor: Color;
};

export type ParsedGameEntry = {
  id: string;
  sgf: string;
  round: number | null;
  props: string;
};

export type StageResult = {
  year: number;
  matched: number;
  unmatched: number;
  totalSgfs: number;
  reused: number;
  unmatchedEntries: UnmatchedEntry[];
};

export type UnmatchedEntry = {
  filename: string;
  line: string;
  reasons: string[];
};

export type StageAnalysisResult = {
  previousEntries: string[];
  reusedEntries: string[];
  matchedEntries: string[];
  unmatchedEntries: UnmatchedEntry[];
  totalSgfs: number;
  claimedSgfs: string[];
  inlineUpdates?: InlineGameUpdate[];
};

export type InlineGameUpdate = {
  path: (string | number)[];
  value: string;
};
