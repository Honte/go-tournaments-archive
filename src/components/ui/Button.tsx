import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from '@/components/navigation/Link';

type ButtonProps = {
  icon?: ReactNode;
} & ((ComponentProps<'button'> & { href?: never }) | LinkProps);

const BUTTON_CLASS = `
  inline-flex items-center
  px-2 py-1 rounded font-bold
  bg-archive-control text-archive-text
  hover:bg-archive-control-hover hover:text-archive-link-hover
  cursor-pointer
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-focus-ring
`;

export function Button({ children, className, icon, ...props }: ButtonProps) {
  const buttonClassName = clsx(BUTTON_CLASS, className);
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
