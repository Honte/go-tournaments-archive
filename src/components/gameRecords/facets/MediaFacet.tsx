'use client';

import { useStore } from 'zustand';
import { GAME_MEDIA, type GameMedia } from '@/libs/gameRecords';
import { Toggle } from '@/components/ui/Toggle';
import type { GameFacetProps } from './types';

export function MediaFacet({ store, t }: GameFacetProps) {
  const selected = useStore(store, (state) => state.model.state.media);
  const counts = useStore(store, (state) => state.model.facets.media);
  const setFilters = useStore(store, (state) => state.setFilters);
  const labels: Record<GameMedia, string> = {
    ogs: t('gamesFilter.hasOgs'),
    yt: t('gamesFilter.hasYoutube'),
    ai: t('gamesFilter.hasAi'),
  };

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">{t('gamesFilter.media')}</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-2 rounded-sm border border-archive-border bg-archive-surface px-2 py-2">
        {GAME_MEDIA.map((media) => (
          <Toggle
            key={media}
            checked={selected.includes(media)}
            disabled={counts[media] === 0 && !selected.includes(media)}
            onChange={(checked) =>
              setFilters({
                media: checked ? [...selected, media] : selected.filter((selectedMedia) => selectedMedia !== media),
              })
            }
          >
            {labels[media]}
            {` (${counts[media]})`}
          </Toggle>
        ))}
      </div>
    </fieldset>
  );
}
