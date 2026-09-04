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
  toCount: (value: number) => string;
};

export function ArchiveStatLink({ detail, toCount }: ArchiveStatLinkProps) {
  const Icon = detail.icon;
  const percentage = detail.progress === undefined ? undefined : Math.round(detail.progress * 1000) / 10;

  return (
    <Link
      href={detail.href}
      title={detail.title}
      className="group block min-w-0 rounded-lg p-1.5 transition-colors hover:bg-archive-surface-hover-accent"
    >
      <div className="flex min-h-6 items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-archive-accent-fill text-archive-accent-text">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-sm leading-6 text-archive-text-muted group-hover:text-archive-link-hover">
          {detail.label}
        </span>
        <strong className="shrink-0 text-sm leading-6 whitespace-nowrap tabular-nums">
          {detail.formattedValue ?? toCount(detail.value)}
        </strong>
        <LuArrowRight
          className="size-3.5 shrink-0 text-archive-text-muted transition-colors group-hover:text-archive-link"
          aria-hidden="true"
        />
      </div>
      {percentage !== undefined && (
        <div
          className="mt-1.5 h-1 overflow-hidden rounded-full bg-archive-surface-muted"
          role="progressbar"
          aria-label={detail.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div className="h-full rounded-full bg-archive-accent" style={{ width: `${percentage}%` }} />
        </div>
      )}
    </Link>
  );
}
