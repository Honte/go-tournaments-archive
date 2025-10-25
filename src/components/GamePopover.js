'use client';

import { autoUpdate, useFloating } from '@floating-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '@/components/Game';

export const SHOW_POPOVER_EVENT = 'show-game-popover';

export function GamePopover({ translations }) {
  const [state, setState] = useState(null);
  const { refs, floatingStyles, elements } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'top',
  });

  const showListener = useCallback(
    (event) => {
      if (!event.detail?.game || event.detail?.game === state?.game) {
        setState(null);
      } else {
        setState(event.detail);
        refs.setReference(event.detail.target || event.target);
      }
    },
    [refs, state, setState]
  );

  const closeListener = useCallback(
    (event) => {
      let target = event.target;

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
        <div ref={refs.setFloating} style={floatingStyles}>
          <div
            role="tooltip"
            className="z-10 relative text-sm text-pgc-dark bg-pgc-light border border-gray-400 rounded-lg shadow-sm after:absolute after:w-[10px] after:h-[10px] after:bg-pgc-light after:left-[calc(50%-5px)] after:rotate-45 after:bottom-[-5.5px] after:border-b after:border-r after:border-gray-400"
          >
            {state?.title && (
              <div className="px-3 py-2 border-b border-gray-200 rounded-t-lg">
                <h3 className="font-semibold ">{state?.title}</h3>
              </div>
            )}
            <div className="p-4">
              <Game game={state.game} players={state.players} translations={translations} wide={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
