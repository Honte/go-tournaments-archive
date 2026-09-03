import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from '@/components/navigation/Link';

type ButtonProps = {
  icon?: ReactNode;
} & ((ComponentProps<'button'> & { href?: never }) | LinkProps);

export function Button({ children, className, icon, ...props }: ButtonProps) {
  const buttonClassName = `bg-archive-control hover:bg-archive-control-hover text-archive-text hover:text-archive-link-hover font-bold py-0.5 px-2 rounded inline-flex items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-focus-ring ${className ?? ''}`;
  const content = (
    <>
      {children}
      {icon != null && (
        <span className="ml-1.5 inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  if (typeof props.href === 'string') {
    return (
      <Link className={buttonClassName} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClassName} {...props}>
      {content}
    </button>
  );
}
