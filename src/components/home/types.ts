import type { Player } from '@/schema/data';
import type { LocalizedString } from '@/i18n/consts';

export type EventMetadata = {
  country?: string;
  end?: string;
  location?: string;
  start?: string;
};

export type Result = EventMetadata & {
  year: number;
  top: string[][];
  players: Record<string, Player>;
};

export type Announcement = {
  announcement: boolean | LocalizedString;
  website?: string;
  year: number;
};
