import { useEffect } from 'react';
import { FaXmark } from 'react-icons/fa6';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameActions } from '@/components/GameActions';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Overlay } from '@/components/ui/Overlay';
import GameViewerContent from '@/components/viewer/GameViewerContent';
import { useSgfData } from '@/hooks/useSgfData';

type GameViewerDialogProps = {
  event: EventContext;
  sgfPath: string;
  translations: Translations;
  onClose: () => void;
};

export function GameViewerModal({ event, sgfPath, translations, onClose }: GameViewerDialogProps) {
  const t = getTranslator(translations);
  const { data, isPending } = useSgfData(event, sgfPath);

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
          aria-label={data?.title}
          className="flex h-[95dvh] w-[95vw] flex-col overflow-hidden rounded-md bg-event-light text-event-dark shadow-2xl md:w-[min(95vw,calc(95dvh-16.5rem))] md:min-w-md"
        >
          <header className="flex shrink-0 items-center gap-2 p-1 md:p-2 md:px-3 bg-event-dark text-event-light">
            <h2 className="min-w-0 px-1 flex-1 truncate text-sm font-semibold">{data?.title}</h2>
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

          {isPending || !data ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <GameViewerContent event={event} sgf={data} translations={translations} onClose={onClose} />
          )}

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-event-soft px-2 md:px-4 py-2 md:py-3">
            <Button type="button" onClick={onClose}>
              {t('navigation.close')}
            </Button>
            {data?.props && <GameActions event={event} props={data.props} t={t} showOriginal={true} />}
          </footer>
        </section>
      </div>
    </>
  );
}
