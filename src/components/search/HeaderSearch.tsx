'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { SelectInstance } from 'react-select';
import { getTranslator } from '@/i18n/translator';
import type { SearchOption } from '@/libs/search';
import { SearchField, type SearchFieldProps } from '@/components/search/SearchField';
import { SearchIndicator } from '@/components/search/SearchIndicator';
import { COLLAPSED_HEADER_SEARCH_STYLES, HEADER_SEARCH_STYLES } from '@/components/search/searchStyles';

type HeaderSearchProps = Pick<SearchFieldProps, 'event' | 'translations'>;

export function HeaderSearch({ event, translations }: HeaderSearchProps) {
  const selectRef = useRef<SelectInstance<SearchOption, false>>(null);
  const t = getTranslator(translations);
  const [expanded, setExpanded] = useState(false);
  const hoverDismissedRef = useRef(false);
  const focusAfterExpandRef = useRef(false);

  function activate() {
    const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hoverDismissedRef.current = false;
    focusAfterExpandRef.current = canAnimate && !expanded;
    flushSync(() => setExpanded(true));
    if (!focusAfterExpandRef.current) {
      selectRef.current?.focus();
    }
  }

  function collapse() {
    setExpanded(false);
  }

  function dismiss() {
    focusAfterExpandRef.current = false;
    hoverDismissedRef.current = true;
    collapse();
  }

  return (
    <div
      className="ml-auto size-8 shrink-0 text-sm"
      onPointerEnter={(event) => {
        if (!expanded && event.pointerType === 'mouse' && !hoverDismissedRef.current) {
          activate();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          hoverDismissedRef.current = false;
          if (!event.currentTarget.contains(document.activeElement)) {
            focusAfterExpandRef.current = false;
            collapse();
          }
        }
      }}
    >
      <div
        className={`absolute top-0 right-0 transition-[width] duration-150 ease-out motion-reduce:transition-none ${expanded ? 'w-full sm:w-[min(100%,16rem)]' : 'w-8'}`}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'width' && focusAfterExpandRef.current) {
            focusAfterExpandRef.current = false;
            selectRef.current?.focus();
          }
        }}
      >
        <SearchField
          event={event}
          translations={translations}
          selectRef={selectRef}
          styles={expanded ? HEADER_SEARCH_STYLES : COLLAPSED_HEADER_SEARCH_STYLES}
          placeholder={t('search.placeholder')}
          menuEnabled={expanded}
          renderIndicator={({ inputId, clear, dismiss: dismissField }) => (
            <SearchIndicator
              hero={false}
              expanded={expanded}
              label={t(expanded ? 'search.close' : 'search.label')}
              inputId={inputId}
              onClick={
                expanded
                  ? () => {
                      clear();
                      dismissField();
                    }
                  : activate
              }
            />
          )}
          onDismiss={dismiss}
          onCollapse={collapse}
        />
      </div>
    </div>
  );
}
