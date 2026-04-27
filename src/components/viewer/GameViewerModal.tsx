'use client';

import { useSgfData } from '@/hooks/useSgfData';
import { useEffect } from 'react';
import { FaXmark } from 'react-icons/fa6';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameActions } from '@/components/GameActions';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Overlay } from '@/components/ui/Overlay';
import { GameViewerContent } from '@/components/viewer/GameViewerContent';
import type { GameViewerPayload } from '@/components/viewer/schema';

type GameViewerDialogProps = {
  payload: GameViewerPayload;
  translations: Translations;
  onClose: () => void;
};

export function GameViewerModal({ payload, translations, onClose }: GameViewerDialogProps) {
  const t = getTranslator(translations);
  const { data, isPending } = useSgfData(payload.props.sgf);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <>
      <Overlay visible={true} className="z-50" />
      <div className="fixed inset-0 z-60 flex items-center justify-center" role="presentation">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={payload.title}
          className="flex max-h-[95dvh] w-[95vw] flex-col overflow-hidden rounded-md bg-event-light text-event-dark shadow-2xl md:h-[95dvh] md:w-[min(95vw,calc(95dvh-16.5rem))] md:min-w-md"
        >
          <header className="flex items-center gap-2 p-1 md:p-2 md:px-3 bg-event-dark text-event-light">
            <h2 className="min-w-0 px-1 flex-1 truncate text-sm font-semibold">{payload.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-6 md:size-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white/15"
              aria-label={t('navigation.close')}
              title={t('navigation.close')}
            >
              <FaXmark />
            </button>
          </header>

          {isPending ? (
            <Loader />
          ) : (
            <GameViewerContent sgf={data!} payload={payload} translations={translations} onClose={onClose} />
          )}

          <footer className="flex items-center justify-between gap-3 border-t border-event-soft px-2 md:px-4 py-2 md:py-3">
            <Button type="button" onClick={onClose}>
              {t('navigation.close')}
            </Button>
            <GameActions props={payload.props} t={t} />
          </footer>
        </section>
      </div>
    </>
  );
}
