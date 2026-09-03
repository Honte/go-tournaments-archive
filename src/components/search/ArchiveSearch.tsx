'use client';

import { useRouter } from 'next/navigation';
import { type FocusEvent, useId, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LuSearch } from 'react-icons/lu';
import Select, {
  components,
  type ControlProps,
  type InputActionMeta,
  type SelectInstance,
  type SingleValue,
} from 'react-select';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { navigate } from '@/libs/navigation';
import { findSearchResults, getSearchDestinations, prepareSearchEntities } from '@/libs/search';
import { SELECT_THEME } from '@/libs/themes';
import { SearchIndicator } from '@/components/search/SearchIndicator';
import { createOption, type SearchOption } from '@/components/search/searchOptions';
import { SearchResultOption } from '@/components/search/SearchResultOption';
import { getSearchStyles } from '@/components/search/searchStyles';
import { useSearchData } from '@/hooks/useSearchData';

export type ArchiveSearchProps = {
  event: EventContext;
  translations: Translations;
  variant?: 'header' | 'hero';
};

export function ArchiveSearch({ event, translations, variant = 'header' }: ArchiveSearchProps) {
  const id = useId();
  const hero = variant === 'hero';
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const expanded = hero || headerExpanded;
  const styles = useMemo(() => getSearchStyles(hero, expanded), [hero, expanded]);
  const router = useRouter();
  const t = getTranslator(translations);
  const selectRef = useRef<SelectInstance<SearchOption, false>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverDismissedRef = useRef(false);
  const focusAfterExpandRef = useRef(false);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchData = useSearchData(event, translations.locale, focused);
  const entities = useMemo(() => (searchData.data ? prepareSearchEntities(searchData.data) : []), [searchData.data]);
  const options = useMemo(() => {
    const results = findSearchResults(entities, inputValue, translations.locale);

    return results.map((entity) => createOption(entity, getSearchDestinations(entity, event, translations.locale), t));
  }, [entities, event, inputValue, t, translations.locale]);

  function activateSearch() {
    hoverDismissedRef.current = false;
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    focusAfterExpandRef.current = animate && !headerExpanded;
    flushSync(() => setHeaderExpanded(true));
    if (!focusAfterExpandRef.current) {
      selectRef.current?.focus();
    }
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    setFocused(true);
    requestAnimationFrame(() => {
      if (document.activeElement === input) {
        input.select();
      }
    });

    if (searchData.isError) {
      void searchData.refetch();
    }
  }

  function handleInputChange(value: string, meta: InputActionMeta) {
    if (meta.action === 'input-change') {
      setInputValue(value);
    }
  }

  function handleClear() {
    setInputValue('');
    selectRef.current?.focus();
  }

  function handleClose() {
    setInputValue('');
    dismissSearch();
  }

  function dismissSearch() {
    focusAfterExpandRef.current = false;
    hoverDismissedRef.current = true;
    selectRef.current?.blur();
    setFocused(false);
    setMenuOpen(false);
    setHeaderExpanded(false);
  }

  function handleBlur() {
    requestAnimationFrame(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setFocused(false);
        setHeaderExpanded(false);
        setMenuOpen(false);
      }
    });
  }

  function handleNavigate(href: string) {
    selectRef.current?.blur();
    setFocused(false);
    setHeaderExpanded(false);
    setInputValue('');

    if (navigate(href) === 'route') {
      router.push(href);
    }
  }

  function handleChange(option: SingleValue<SearchOption>) {
    if (!option) {
      return;
    }

    handleNavigate(option.href);
  }

  const isLoading = Boolean(inputValue) && searchData.isPending;
  const indicatorLabel = t(hero ? 'search.clear' : expanded ? 'search.close' : 'search.label');

  return (
    <div
      ref={containerRef}
      className={hero ? 'mt-6 w-full max-w-xl text-sm' : 'ml-auto size-8 shrink-0 text-sm'}
      onPointerEnter={(event) => {
        if (!hero && !headerExpanded && event.pointerType === 'mouse' && !hoverDismissedRef.current) {
          activateSearch();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          hoverDismissedRef.current = false;
          if (!containerRef.current?.contains(document.activeElement)) {
            focusAfterExpandRef.current = false;
            setHeaderExpanded(false);
          }
        }
      }}
      onBlur={handleBlur}
    >
      <div
        className={
          hero
            ? undefined
            : `absolute top-0 right-0 transition-[width] duration-150 ease-out motion-reduce:transition-none ${expanded ? 'w-full sm:w-[min(100%,16rem)]' : 'w-8'}`
        }
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'width' && focusAfterExpandRef.current) {
            focusAfterExpandRef.current = false;
            selectRef.current?.focus();
          }
        }}
      >
        <Select<SearchOption, false>
          ref={selectRef}
          instanceId={id}
          inputId={`${id}-input`}
          aria-label={t('search.label')}
          value={null}
          inputValue={inputValue}
          closeMenuOnSelect={false}
          options={options}
          onInputChange={handleInputChange}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              dismissSearch();
            }
          }}
          placeholder={t(hero ? 'site.searchPlaceholder' : 'search.placeholder')}
          noOptionsMessage={() => (searchData.isError ? t('search.error') : t('search.noResults'))}
          loadingMessage={() => t('search.loading')}
          isLoading={isLoading}
          isSearchable={true}
          menuIsOpen={expanded && focused && menuOpen && Boolean(inputValue)}
          onMenuOpen={() => setMenuOpen(true)}
          onMenuClose={() => setMenuOpen(false)}
          tabSelectsValue={false}
          filterOption={null}
          getOptionValue={(option) => option.value}
          formatOptionLabel={(option, meta) =>
            meta.context === 'menu' ? <SearchResultOption option={option} onNavigate={handleNavigate} /> : option.label
          }
          components={{
            Control: hero ? HeroSearchControl : components.Control,
            IndicatorSeparator: null,
            LoadingIndicator: () => null,
            DropdownIndicator: () =>
              hero && !inputValue ? null : (
                <SearchIndicator
                  hero={hero}
                  expanded={expanded}
                  label={indicatorLabel}
                  inputId={`${id}-input`}
                  onClick={hero ? handleClear : expanded ? handleClose : activateSearch}
                />
              ),
            LoadingMessage: ({ innerProps }) => (
              <div
                {...innerProps}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-archive-text-muted"
              >
                <span className="size-4 animate-spin rounded-full border-2 border-archive-border border-t-archive-accent" />
                {t('search.loading')}
              </div>
            ),
          }}
          styles={styles}
          theme={SELECT_THEME}
        />
      </div>
    </div>
  );
}

function HeroSearchControl(props: ControlProps<SearchOption, false>) {
  return (
    <components.Control {...props}>
      <LuSearch className="ml-4 shrink-0 text-archive-text-muted" aria-hidden="true" />
      {props.children}
    </components.Control>
  );
}
