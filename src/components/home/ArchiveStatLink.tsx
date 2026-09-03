import type { IconType } from 'react-icons';
import { LuArrowRight } from 'react-icons/lu';
import { Link } from '@/components/navigation/Link';

export type GameDetail = {
  href: string;
  icon: IconType;
  label: string;
  value: number;
  formattedValue?: string;
  progress?: number;
  title?: string;
};

type ArchiveStatLinkProps = {
  detail: GameDetail;
  number: Intl.NumberFormat;
};

export function ArchiveStatLink({ detail, number }: ArchiveStatLinkProps) {
  const Icon = detail.icon;
  const percentage = detail.progress === undefined ? undefined : Math.round(detail.progress * 1000) / 10;

  return (
    <Link
      href={detail.href}
      title={detail.title}
      className="group min-w-0 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-archive-surface-hover-accent"
    >
      <span className="grid min-h-6 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-archive-accent-fill text-archive-accent-text">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 text-sm leading-6 text-archive-text-muted group-hover:text-archive-link-hover">
          {detail.label}
        </span>
        <strong className="text-right text-sm leading-6 whitespace-nowrap tabular-nums">
          {detail.formattedValue ?? number.format(detail.value)}
        </strong>
        <LuArrowRight
          className="size-3.5 shrink-0 text-archive-text-muted transition-colors group-hover:text-archive-link"
          aria-hidden="true"
        />
      </span>
      {percentage !== undefined && (
        <span
          className="mt-1.5 block h-1 overflow-hidden rounded-full bg-archive-surface-muted"
          role="progressbar"
          aria-label={detail.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span className="block h-full rounded-full bg-archive-accent" style={{ width: `${percentage}%` }} />
        </span>
      )}
    </Link>
  );
}
