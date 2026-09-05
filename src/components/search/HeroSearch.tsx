'use client';

import { useRef } from 'react';
import { LuSearch } from 'react-icons/lu';
import { components, type ControlProps, type SelectInstance } from 'react-select';
import { getTranslator } from '@/i18n/translator';
import { SearchField, type SearchFieldProps } from '@/components/search/SearchField';
import { SearchIndicator } from '@/components/search/SearchIndicator';
import type { SearchOption } from '@/components/search/searchOptions';
import { HERO_SEARCH_STYLES } from '@/components/search/searchStyles';

type HeroSearchProps = Pick<SearchFieldProps, 'event' | 'translations'>;

export function HeroSearch({ event, translations }: HeroSearchProps) {
  const selectRef = useRef<SelectInstance<SearchOption, false>>(null);
  const t = getTranslator(translations);

  return (
    <div className="mt-6 w-full max-w-xl text-sm">
      <SearchField
        event={event}
        translations={translations}
        selectRef={selectRef}
        styles={HERO_SEARCH_STYLES}
        placeholder={t('site.searchPlaceholder')}
        control={HeroSearchControl}
        renderIndicator={({ inputId, inputValue, clear }) =>
          inputValue ? (
            <SearchIndicator
              hero
              expanded
              label={t('search.clear')}
              inputId={inputId}
              onClick={() => {
                clear();
                selectRef.current?.focus();
              }}
            />
          ) : null
        }
      />
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
