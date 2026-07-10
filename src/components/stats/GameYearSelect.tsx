'use client';

import { useMemo } from 'react';
import Select, { type MultiValue, type StylesConfig, type ThemeConfig } from 'react-select';

type YearOption = {
  value: number;
  label: string;
};

export type GameYearSelectProps = {
  id: string;
  label: string;
  years: readonly number[];
  selectedYears: readonly number[];
  placeholder: string;
  noOptionsMessage: string;
  onChange: (years: number[]) => void;
};

const styles: StylesConfig<YearOption, true> = {
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
  option: (base) => ({
    ...base,
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--color-event-bg)',
  }),
  multiValueRemove: (base) => ({
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

export function GameYearSelect({
  id,
  label,
  years,
  selectedYears,
  placeholder,
  noOptionsMessage,
  onChange,
}: GameYearSelectProps) {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const options = useMemo<YearOption[]>(
    () => years.toSorted((left, right) => right - left).map((year) => ({ value: year, label: String(year) })),
    [years]
  );
  const selected = useMemo(
    () => options.filter((option) => selectedYears.includes(option.value)),
    [options, selectedYears]
  );

  return (
    <div className="min-w-0">
      <label id={labelId} htmlFor={inputId} className="mb-1 block text-sm font-semibold text-event-dark">
        {label}
      </label>
      <Select<YearOption, true>
        id={id}
        instanceId={id}
        inputId={inputId}
        aria-labelledby={labelId}
        aria-live="polite"
        name="year"
        options={options}
        value={selected}
        onChange={(next: MultiValue<YearOption>) =>
          onChange(next.map((option) => option.value).toSorted((left, right) => left - right))
        }
        placeholder={placeholder}
        noOptionsMessage={() => noOptionsMessage}
        isMulti={true}
        isClearable={true}
        isSearchable={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPlacement="auto"
        styles={styles}
        theme={theme}
      />
    </div>
  );
}
