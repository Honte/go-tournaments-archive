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
      className={twMerge(`underline text-archive-link hover:text-archive-link-hover ${className || ''}`)}
      title={title}
      aria-label={title}
      {...props}
    >
      {children}
    </a>
  );
}
