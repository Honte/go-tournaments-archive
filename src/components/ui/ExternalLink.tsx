import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export function ExternalLink({
  href,
  children = href.replace(/^https?:\/\//, ''),
  title,
  className,
  ...props
}: ComponentProps<'a'> & { href: string }) {
  return (
    <a
      href={href}
      className={twMerge(`underline text-event-primary hover:text-event-hover ${className || ''}`)}
      title={title}
      aria-label={title}
      {...props}
    >
      {children}
    </a>
  );
}
