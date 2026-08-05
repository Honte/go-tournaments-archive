import { DualRange } from '@/components/ui/DualRange';

export type RankRangeProps = {
  id: string;
  label: string;
  ranks: readonly string[];
  minimum?: string;
  maximum?: string;
  minimumLabel: string;
  maximumLabel: string;
  anyLabel: string;
  onChange: (minimum?: string, maximum?: string) => void;
};

export function RankRange({
  id,
  label,
  ranks,
  minimum,
  maximum,
  minimumLabel,
  maximumLabel,
  anyLabel,
  onChange,
}: RankRangeProps) {
  const lastIndex = Math.max(0, ranks.length - 1);
  const minimumIndex = minimum ? ranks.indexOf(minimum) : 0;
  const maximumIndex = maximum ? ranks.indexOf(maximum) : lastIndex;

  return (
    <DualRange
      id={id}
      label={label}
      minimum={0}
      maximum={lastIndex}
      lowerValue={minimumIndex >= 0 ? minimumIndex : 0}
      upperValue={maximumIndex >= 0 ? maximumIndex : lastIndex}
      lowerLabel={`${label}: ${minimumLabel}`}
      upperLabel={`${label}: ${maximumLabel}`}
      formatValue={(index) => ranks[index] ?? anyLabel}
      disabled={ranks.length < 2}
      onCommit={(lowerIndex, upperIndex) =>
        onChange(
          lowerIndex === 0 ? undefined : ranks[lowerIndex],
          upperIndex === lastIndex ? undefined : ranks[upperIndex]
        )
      }
    />
  );
}
