import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type OverlayProps = ComponentProps<'div'> & {
  visible: boolean;
};

export function Overlay({ visible, className, ...rest }: OverlayProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'fixed inset-x-0 top-0 bottom-0 z-30 bg-black/60 transition-opacity duration-200',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
          className
        )
      )}
      aria-hidden
      {...rest}
    />
  );
}
