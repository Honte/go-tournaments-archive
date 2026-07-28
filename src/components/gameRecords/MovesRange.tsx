import { DualRange } from '@/components/ui/DualRange';

export type MovesRangeProps = {
  id: string;
  label: string;
  minimum?: number;
  maximum?: number;
  domainMinimum?: number;
  domainMaximum?: number;
  minimumLabel: string;
  maximumLabel: string;
  onChange: (minimum?: number, maximum?: number) => void;
};

export function MovesRange({
  id,
  label,
  minimum,
  maximum,
  domainMinimum = 0,
  domainMaximum = 0,
  minimumLabel,
  maximumLabel,
  onChange,
}: MovesRangeProps) {
  return (
    <DualRange
      id={id}
      label={label}
      minimum={domainMinimum}
      maximum={domainMaximum}
      lowerValue={minimum ?? domainMinimum}
      upperValue={maximum ?? domainMaximum}
      lowerLabel={`${label}: ${minimumLabel}`}
      upperLabel={`${label}: ${maximumLabel}`}
      disabled={domainMinimum >= domainMaximum}
      onCommit={(lowerValue, upperValue) =>
        onChange(
          lowerValue === domainMinimum ? undefined : lowerValue,
          upperValue === domainMaximum ? undefined : upperValue
        )
      }
    />
  );
}
