import { Toggle } from '@/components/ui/Toggle';

type FilterToggleGroupProps<T extends string> = {
  legend: string;
  values: readonly T[];
  selected: readonly T[];
  labels: Record<T, string>;
  counts?: Partial<Record<T, number>>;
  disableZero?: boolean;
  onChange: (selected: T[]) => void;
};

export function FilterToggleGroup<T extends string>({
  legend,
  values,
  selected,
  labels,
  counts,
  disableZero,
  onChange,
}: FilterToggleGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-2 rounded-sm border border-event-soft bg-white px-2 py-2">
        {values.map((value) => (
          <Toggle
            key={value}
            checked={selected.includes(value)}
            disabled={disableZero && counts?.[value] === 0 && !selected.includes(value)}
            onChange={(checked) =>
              onChange(checked ? [...selected, value] : selected.filter((selectedValue) => selectedValue !== value))
            }
          >
            {labels[value]}
            {counts?.[value] !== undefined ? ` (${counts[value]})` : ''}
          </Toggle>
        ))}
      </div>
    </fieldset>
  );
}
