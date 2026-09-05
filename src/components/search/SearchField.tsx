'use client';

import { useRouter } from 'next/navigation';
import {
  type ComponentType,
  type FocusEvent,
  type ReactNode,
  type RefObject,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import Select, {
  components,
  type ControlProps,
  type InputActionMeta,
  type SelectInstance,
  type StylesConfig,
} from 'react-select';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { navigate } from '@/libs/navigation';
import { findSearchResults, getSearchDestinations, prepareSearchEntities } from '@/libs/search';
import { SELECT_THEME } from '@/libs/themes';
import { createOption, type SearchOption } from '@/components/search/searchOptions';
import { SearchResultOption } from '@/components/search/SearchResultOption';
import { useSearchData } from '@/hooks/useSearchData';

export type SearchFieldProps = {
  event: EventContext;
  translations: Translations;
  selectRef: RefObject<SelectInstance<SearchOption, false> | null>;
  styles: StylesConfig<SearchOption, false>;
  placeholder: string;
  control?: ComponentType<ControlProps<SearchOption, false>>;
  menuEnabled?: boolean;
  renderIndicator: (props: {
    inputId: string;
    inputValue: string;
    clear: () => void;
    dismiss: () => void;
  }) => ReactNode;
  onDismiss?: () => void;
  onCollapse?: () => void;
};

export function SearchField({
  event,
  translations,
  selectRef,
  styles,
  placeholder,
  control = components.Control,
  menuEnabled = true,
  renderIndicator,
  onDismiss,
  onCollapse,
}: SearchFieldProps) {
  const id = useId();
  const router = useRouter();
  const t = getTranslator(translations);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const searchData = useSearchData(event, translations.locale, focused);
  const entities = useMemo(() => (searchData.data ? prepareSearchEntities(searchData.data) : []), [searchData.data]);
  const options = useMemo(() => {
    const results = findSearchResults(entities, inputValue, translations.locale);
    const translate = getTranslator(translations);

    return results.map((entity) =>
      createOption(entity, getSearchDestinations(entity, event, translations.locale), translate)
    );
  }, [entities, event, inputValue, translations]);

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

  function blur() {
    selectRef.current?.blur();
    setFocused(false);
  }

  function dismiss() {
    onDismiss?.();
    blur();
  }

  function handleBlur() {
    requestAnimationFrame(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setFocused(false);
        onCollapse?.();
      }
    });
  }

  function handleNavigate(href: string) {
    blur();
    onCollapse?.();
    setInputValue('');

    if (navigate(href) === 'route') {
      router.push(href);
    }
  }

  const isLoading = Boolean(inputValue) && searchData.isPending;

  return (
    <div ref={containerRef} onBlur={handleBlur}>
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
        onChange={(option) => {
          if (option) {
            handleNavigate(option.href);
          }
        }}
        onFocus={handleFocus}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            dismiss();
          }
        }}
        placeholder={placeholder}
        noOptionsMessage={() => (searchData.isError ? t('search.error') : t('search.noResults'))}
        loadingMessage={() => t('search.loading')}
        isLoading={isLoading}
        isSearchable={true}
        menuIsOpen={menuEnabled && focused && inputValue ? undefined : false}
        tabSelectsValue={false}
        filterOption={null}
        getOptionValue={(option) => option.value}
        formatOptionLabel={(option, meta) =>
          meta.context === 'menu' ? <SearchResultOption option={option} onNavigate={handleNavigate} /> : option.label
        }
        components={{
          Control: control,
          IndicatorSeparator: null,
          LoadingIndicator: () => null,
          DropdownIndicator: () =>
            renderIndicator({ inputId: `${id}-input`, inputValue, clear: () => setInputValue(''), dismiss }),
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
  );
}
