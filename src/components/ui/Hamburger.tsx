import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

export type HamburgerProps = Omit<ComponentProps<'button'>, 'type'> & {
  open: boolean;
  label?: string;
};

export function Hamburger({ open, label, className, ...rest }: HamburgerProps) {
  return (
    <button
      type="button"
      className={clsx('text-event-light relative h-10 w-10 -ml-2 shrink-0 cursor-pointer', className)}
      aria-expanded={open}
      aria-label={label}
      title={label}
      {...rest}
    >
      <span
        aria-hidden
        className={clsx(
          'absolute left-1/2 top-1/2 block h-0.5 w-5 bg-current rounded-full transition-transform duration-200',
          open ? 'transform-[translate(-50%,-50%)_rotate(45deg)]' : 'transform-[translate(-50%,-50%)_translateY(-7px)]'
        )}
      />
      <span
        aria-hidden
        className={clsx(
          'absolute left-1/2 top-1/2 block h-0.5 w-5 bg-current rounded-full transition-opacity duration-200 transform-[translate(-50%,-50%)]',
          open ? 'opacity-0' : 'opacity-100'
        )}
      />
      <span
        aria-hidden
        className={clsx(
          'absolute left-1/2 top-1/2 block h-0.5 w-5 bg-current rounded-full transition-transform duration-200',
          open ? 'transform-[translate(-50%,-50%)_rotate(-45deg)]' : 'transform-[translate(-50%,-50%)_translateY(7px)]'
        )}
      />
    </button>
  );
}
