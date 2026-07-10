'use client';

import { clsx } from 'clsx';
import { memo, useCallback, useMemo } from 'react';
import Select, {
  createFilter,
  type FormatOptionLabelMeta,
  type SingleValue,
  type StylesConfig,
  type ThemeConfig,
} from 'react-select';

export type GameFacetOption = {
  value: string;
  label: string;
  count: number;
  search?: string;
};

export type GameFacetSelectProps = {
  id: string;
  label: string;
  options: readonly GameFacetOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  noOptionsMessage?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
};

const filterOption = createFilter<GameFacetOption>({
  stringify: ({ data }) => `${data.label} ${data.value} ${data.search ?? ''}`,
});

const styles: StylesConfig<GameFacetOption, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'white',
    '&:hover': {
      borderColor: 'var(--color-event-hover)',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  clearIndicator: (base) => ({
    ...base,
    cursor: 'pointer',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    cursor: 'pointer',
  }),
};

const theme: ThemeConfig = (base) => ({
  ...base,
  borderRadius: 4,
  colors: {
    ...base.colors,
    primary: 'var(--color-event-primary)',
    primary75: 'var(--color-event-hover)',
    primary50: 'var(--color-event-soft)',
    primary25: 'var(--color-event-bg)',
    neutral0: '#ffffff',
    neutral5: 'var(--color-event-light)',
    neutral10: 'var(--color-event-bg)',
    neutral20: 'var(--color-event-soft)',
    neutral30: 'var(--color-event-gray)',
    neutral40: 'var(--color-event-gray)',
    neutral50: 'var(--color-event-gray)',
    neutral60: 'var(--color-event-dark)',
    neutral70: 'var(--color-event-dark)',
    neutral80: 'var(--color-event-dark)',
    neutral90: 'var(--color-event-dark)',
  },
});

function getOptionLabel(option: GameFacetOption) {
  return `${option.label} (${option.count})`;
}

function getOptionValue(option: GameFacetOption) {
  return option.value;
}

function formatOptionLabel(option: GameFacetOption, meta: FormatOptionLabelMeta<GameFacetOption>) {
  return meta.context === 'menu' ? getOptionLabel(option) : option.label;
}

function isOptionDisabled(option: GameFacetOption) {
  return option.count <= 0;
}

export const GameFacetSelect = memo(function GameFacetSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  noOptionsMessage,
  name,
  disabled = false,
  className,
}: GameFacetSelectProps) {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const selectedOption = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);
  const visibleOptions = useMemo(
    () => options.filter((option) => option.count > 0 || option.value === value),
    [options, value]
  );
  const handleChange = useCallback(
    (option: SingleValue<GameFacetOption>) => {
      onChange(option?.value ?? null);
    },
    [onChange]
  );

  return (
    <div className={clsx('min-w-0', className, disabled && 'opacity-60')}>
      <label id={labelId} htmlFor={inputId} className="mb-1 block text-sm font-semibold text-event-dark">
        {label}
      </label>
      <Select<GameFacetOption, false>
        id={id}
        instanceId={id}
        inputId={inputId}
        aria-labelledby={labelId}
        aria-live="polite"
        name={name}
        options={visibleOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : undefined}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        formatOptionLabel={formatOptionLabel}
        filterOption={filterOption}
        isOptionDisabled={isOptionDisabled}
        isClearable={true}
        isSearchable={true}
        isDisabled={disabled}
        hideSelectedOptions={false}
        menuPlacement="auto"
        styles={styles}
        theme={theme}
      />
    </div>
  );
});
