import { clsx } from 'clsx';
import { Link } from '@/components/navigation/Link';

type PillLinkProps = {
  label: string;
  href: string;
  active: boolean;
};

export function PillLink({ label, href, active }: PillLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'inline-flex rounded-sm px-2 py-0.5 font-bold',
        active
          ? 'bg-archive-control-selected text-archive-control-selected-text'
          : 'bg-archive-control text-archive-text hover:bg-archive-control-hover'
      )}
    >
      {label}
    </Link>
  );
}
