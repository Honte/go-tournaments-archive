'use client';

import type { Game, Player } from '@/schema/data';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { useCallback, useEffect, useState } from 'react';
import type { Translations } from '@/i18n/consts';
import { Game as GameComponent } from '@/components/Game';








export const SHOW_POPOVER_EVENT = 'show-game-popover';

type PopoverState = {
  game: Game;
  players: Record<string, Player>;
  target?: Element;
  title?: string;
};

type GamePopoverProps = {
  translations: Translations;
};

export function GamePopover({ translations }: GamePopoverProps) {
  const [state, setState] = useState<PopoverState | null>(null);
  const { refs, floatingStyles, elements } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'top',
  });

  const showListener = useCallback(
    (event: Event) => {
      const detail = (event as CustomEvent<PopoverState>).detail;
      if (!detail?.game || detail?.game === state?.game) {
        setState(null);
      } else {
        setState(detail);
        refs.setReference(detail.target ?? (event.target as Element));
      }
    },
    [refs, state, setState]
  );

  const closeListener = useCallback(
    (event: Event) => {
      let target: Node | null = event.target as Node;

      do {
        if (target === elements.floating) {
          return;
        }
        target = target.parentNode;
      } while (target);

      setState(null);
    },
    [setState, elements.floating]
  );

  useEffect(() => {
    document.addEventListener(SHOW_POPOVER_EVENT, showListener);
    return () => document.removeEventListener(SHOW_POPOVER_EVENT, showListener);
  }, [showListener]);

  useEffect(() => {
    if (state) {
      document.addEventListener('pointerdown', closeListener, { capture: true });
    } else {
      document.removeEventListener('pointerdown', closeListener, { capture: true });
    }

    return () => document.removeEventListener('pointerdown', closeListener, { capture: true });
  }, [closeListener, state]);

  return (
    <>
      {state && (
        // eslint-disable-next-line react-hooks/refs -- https://github.com/floating-ui/floating-ui/discussions/3405
        <div ref={refs.setFloating} style={floatingStyles}>
          <div
            role="tooltip"
            className="z-10 relative text-sm text-event-dark bg-event-light border border-gray-400 rounded-lg shadow-sm after:absolute after:w-[10px] after:h-[10px] after:bg-event-light after:left-[calc(50%-5px)] after:rotate-45 after:bottom-[-5.5px] after:border-b after:border-r after:border-gray-400"
          >
            {state?.title && (
              <div className="px-3 py-2 border-b border-gray-200 rounded-t-lg">
                <h3 className="font-semibold ">{state?.title}</h3>
              </div>
            )}
            <div className="p-4">
              <GameComponent game={state.game} players={state.players} translations={translations} wide={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
