'use client';

import { useRouter } from 'next/navigation';
import { type FocusEvent, useId, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LuSearch, LuX } from 'react-icons/lu';
import Select, {
  components,
  type ControlProps,
  type InputActionMeta,
  type SelectInstance,
  type SingleValue,
  type StylesConfig,
} from 'react-select';
import type { EventContext } from '@/schema/event';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { navigate } from '@/libs/navigation';
import {
  findSearchResults,
  getSearchDestinations,
  prepareSearchEntities,
  type SearchDestination,
  type SearchEntity,
} from '@/libs/search';
import { SELECT_THEME } from '@/libs/themes';
import { useSearchData } from '@/hooks/useSearchData';

type SearchOption = {
  value: string;
  label: string;
  primary: string;
  secondary?: string;
  href: string;
  gamesHref?: string;
  gamesLabel?: string;
};

const getStyles = (hero: boolean, expanded: boolean): StylesConfig<SearchOption, false> => ({
  container: (base) => ({ ...base, width: '100%' }),
  control: (base, state) => ({
    ...base,
    minHeight: hero ? 46 : 32,
    height: hero ? 46 : 32,
    borderRadius: hero ? 8 : 6,
    backgroundColor: expanded ? 'var(--color-archive-surface)' : 'rgb(255 255 255 / 0.1)',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    borderColor: !expanded
      ? 'rgb(255 255 255 / 0.25)'
      : state.isFocused
        ? 'var(--color-archive-focus-ring)'
        : 'var(--color-archive-border)',
    boxShadow: hero ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none',
    '&:hover': { borderColor: expanded ? 'var(--color-archive-focus-ring)' : 'rgb(255 255 255 / 0.25)' },
  }),
  valueContainer: (base) => ({
    ...base,
    display: expanded ? base.display : 'none',
    minWidth: 0,
    padding: hero ? '0 12px' : '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    color: 'var(--color-archive-text)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--color-archive-text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: hero ? 44 : 30,
    marginLeft: 'auto',
  }),
  menu: (base) => ({
    ...base,
    right: 0,
    left: 'auto',
    zIndex: 50,
    minWidth: 0,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'var(--color-archive-surface)',
    border: '1px solid var(--color-archive-border)',
    borderRadius: hero ? 8 : 6,
    overflow: 'hidden',
    color: 'var(--color-archive-text)',
  }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isFocused ? 'var(--color-archive-surface-hover)' : 'var(--color-archive-surface)',
    color: 'var(--color-archive-text)',
    '&:active': { backgroundColor: 'var(--color-archive-accent-soft)' },
  }),
  loadingMessage: (base) => ({ ...base, color: 'var(--color-archive-text-muted)' }),
  noOptionsMessage: (base) => ({ ...base, color: 'var(--color-archive-text-muted)' }),
});

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
  const styles = useMemo(() => getStyles(hero, expanded), [hero, expanded]);
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
            meta.context === 'menu' ? (
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate">{option.primary}</span>
                {option.secondary && (
                  <span className="flex min-w-0 items-center justify-between gap-3 text-xs text-archive-text-muted">
                    <span className="truncate">{option.secondary}</span>
                    {option.gamesHref && option.gamesLabel && (
                      <a
                        href={option.gamesHref}
                        className="shrink-0 underline hover:text-archive-text"
                        tabIndex={0}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleNavigate(option.gamesHref!);
                        }}
                      >
                        {option.gamesLabel}
                      </a>
                    )}
                  </span>
                )}
              </div>
            ) : (
              option.label
            )
          }
          components={{
            Control: hero ? HeroSearchControl : components.Control,
            IndicatorSeparator: null,
            LoadingIndicator: () => null,
            DropdownIndicator: () =>
              hero && !inputValue ? null : (
                <div className="flex h-full shrink-0 items-center" onTouchEnd={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className={`flex h-full shrink-0 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 ${hero ? 'w-11' : 'w-7.5'} ${expanded ? 'text-archive-text-muted hover:text-archive-text focus-visible:outline-archive-focus-ring' : 'text-xs text-archive-shell-text focus-visible:outline-archive-shell-text'}`}
                    aria-label={indicatorLabel}
                    aria-expanded={hero ? undefined : expanded}
                    aria-controls={`${id}-input`}
                    title={indicatorLabel}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={hero ? handleClear : expanded ? handleClose : activateSearch}
                  >
                    {hero || expanded ? <LuX aria-hidden="true" /> : <LuSearch aria-hidden="true" />}
                  </button>
                </div>
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

function createOption(entity: SearchEntity, destinations: SearchDestination[], t: Translator): SearchOption {
  const country = entity.country ? ` (${entity.country})` : '';
  const destination = destinations[0];
  const gamesDestination = destinations.find(({ kind }) => kind === 'player-games' || kind === 'country-games');
  let primary: string;
  let secondary: string | undefined;

  switch (entity.type) {
    case 'player':
      primary = `${entity.displayName}${country}`;
      secondary = t('search.types.player');
      break;
    case 'tournament':
      primary = entity.displayName ? `${entity.navigationId}, ${entity.displayName}` : String(entity.navigationId);
      secondary =
        [t('search.types.tournament'), entity.location, entity.countryName ?? entity.country]
          .filter(Boolean)
          .join(', ') || undefined;
      break;
    case 'country':
      primary = `${entity.displayName}${country}`;
      secondary = t('search.types.country');
      break;
    case 'category':
      primary = entity.displayName;
      secondary = t('search.types.category');
      break;
  }

  return {
    value: entity.key,
    label: [primary, secondary, gamesDestination && t('search.games', String(entity.gameCount ?? 0))]
      .filter(Boolean)
      .join(' '),
    primary,
    secondary,
    href: destination.href,
    gamesHref: gamesDestination?.href,
    gamesLabel: gamesDestination ? t('search.games', String(entity.gameCount ?? 0)) : undefined,
  };
}
