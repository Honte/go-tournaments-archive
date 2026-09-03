'use client';

import { clsx } from 'clsx';
import { memo, useCallback, useMemo } from 'react';
import Select, {
  createFilter,
  type FormatOptionLabelMeta,
  type MultiValue,
  type SingleValue,
  type StylesConfig,
} from 'react-select';
import { archiveSelectTheme } from '@/components/ui/selectTheme';

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  search?: string;
};

export type FacetSelectProps = {
  id: string;
  label: string;
  options: readonly FacetOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  noOptionsMessage?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  showCounts?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  allowZeroCountOptions?: boolean;
};

export type MultiFacetSelectProps = Omit<FacetSelectProps, 'value' | 'onChange' | 'clearable'> & {
  values: readonly string[];
  onChange: (values: string[]) => void;
};

const filterOption = createFilter<FacetOption>({
  stringify: ({ data }) => `${data.label} ${data.value} ${data.search ?? ''}`,
});

const styles: StylesConfig<FacetOption, boolean> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'var(--color-archive-surface)',
    '&:hover': {
      borderColor: 'var(--color-archive-accent-hover)',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    backgroundColor: state.isSelected ? 'var(--color-archive-control-selected)' : base.backgroundColor,
    color: state.isDisabled ? base.color : state.isSelected ? 'var(--color-archive-control-selected-text)' : base.color,
    ':active': {
      ...base[':active'],
      backgroundColor: state.isDisabled
        ? undefined
        : state.isSelected
          ? 'var(--color-archive-control-selected)'
          : 'var(--color-archive-accent-soft)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    cursor: 'pointer',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--color-archive-surface-muted)',
  }),
  multiValueRemove: (base) => ({
    ...base,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'var(--color-archive-control-hover)',
      color: 'var(--color-archive-text)',
    },
  }),
};

function getOptionLabel(option: FacetOption) {
  return `${option.label} (${option.count})`;
}

function getOptionValue(option: FacetOption) {
  return option.value;
}

function formatOptionLabel(option: FacetOption, meta: FormatOptionLabelMeta<FacetOption>) {
  return meta.context === 'menu' ? getOptionLabel(option) : option.label;
}

function isOptionDisabled(option: FacetOption) {
  return option.count <= 0;
}

export const FacetSelect = memo(function FacetSelect({
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
  showCounts = true,
  searchable = true,
  clearable = true,
  allowZeroCountOptions = false,
}: FacetSelectProps) {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const selectedOption = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);
  const visibleOptions = useMemo(
    () => (allowZeroCountOptions ? options : options.filter((option) => option.count > 0 || option.value === value)),
    [allowZeroCountOptions, options, value]
  );
  const handleChange = useCallback(
    (option: SingleValue<FacetOption>) => {
      onChange(option?.value ?? null);
    },
    [onChange]
  );

  return (
    <div className={clsx('min-w-0', className, disabled && 'opacity-60')}>
      <label id={labelId} htmlFor={inputId} className="mb-1 block text-sm font-semibold text-archive-text">
        {label}
      </label>
      <Select<FacetOption, false>
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
        getOptionLabel={showCounts ? getOptionLabel : (option) => option.label}
        getOptionValue={getOptionValue}
        formatOptionLabel={showCounts ? formatOptionLabel : undefined}
        filterOption={filterOption}
        isOptionDisabled={allowZeroCountOptions ? undefined : isOptionDisabled}
        isClearable={clearable}
        isSearchable={searchable}
        isDisabled={disabled}
        hideSelectedOptions={false}
        menuPlacement="auto"
        styles={styles}
        theme={archiveSelectTheme}
      />
    </div>
  );
});

export const MultiFacetSelect = memo(function MultiFacetSelect({
  id,
  label,
  options,
  values,
  onChange,
  placeholder,
  noOptionsMessage,
  name,
  disabled = false,
  className,
  showCounts = true,
  searchable = true,
  allowZeroCountOptions = false,
}: MultiFacetSelectProps) {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const selectedOptions = useMemo(() => options.filter((option) => values.includes(option.value)), [options, values]);
  const visibleOptions = useMemo(
    () =>
      allowZeroCountOptions ? options : options.filter((option) => option.count > 0 || values.includes(option.value)),
    [allowZeroCountOptions, options, values]
  );
  const handleChange = useCallback(
    (next: MultiValue<FacetOption>) => {
      onChange(next.map((option) => option.value));
    },
    [onChange]
  );

  return (
    <div className={clsx('min-w-0', className, disabled && 'opacity-60')}>
      <label id={labelId} htmlFor={inputId} className="mb-1 block text-sm font-semibold text-archive-text">
        {label}
      </label>
      <Select<FacetOption, true>
        id={id}
        instanceId={id}
        inputId={inputId}
        aria-labelledby={labelId}
        aria-live="polite"
        name={name}
        options={visibleOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : undefined}
        getOptionLabel={showCounts ? getOptionLabel : (option) => option.label}
        getOptionValue={getOptionValue}
        formatOptionLabel={showCounts ? formatOptionLabel : undefined}
        filterOption={filterOption}
        isOptionDisabled={allowZeroCountOptions ? undefined : isOptionDisabled}
        isMulti={true}
        isClearable={true}
        isSearchable={searchable}
        isDisabled={disabled}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPlacement="auto"
        styles={styles}
        theme={archiveSelectTheme}
      />
    </div>
  );
});
