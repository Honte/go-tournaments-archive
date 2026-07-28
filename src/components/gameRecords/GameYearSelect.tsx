'use client';

import { useMemo } from 'react';
import { MultiFacetSelect } from '@/components/ui/FacetSelect';

export type GameYearSelectProps = {
  id: string;
  label: string;
  years: readonly { value: string; label: string; count: number }[];
  selectedYears: readonly number[];
  placeholder: string;
  noOptionsMessage: string;
  onChange: (years: number[]) => void;
};

export function GameYearSelect({
  id,
  label,
  years,
  selectedYears,
  placeholder,
  noOptionsMessage,
  onChange,
}: GameYearSelectProps) {
  const values = useMemo(() => selectedYears.map(String), [selectedYears]);

  return (
    <MultiFacetSelect
      id={id}
      label={label}
      options={years}
      values={values}
      onChange={(next) => onChange(next.map(Number).toSorted((left, right) => left - right))}
      placeholder={placeholder}
      noOptionsMessage={noOptionsMessage}
      name="year"
    />
  );
}
