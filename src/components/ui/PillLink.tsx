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
        active ? 'bg-event-primary text-white' : 'bg-gray-300 text-event-dark hover:bg-gray-400'
      )}
    >
      {label}
    </Link>
  );
}
