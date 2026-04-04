import type { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type ExternalLinkProps = PropsWithChildren<{
  url: string;
  title?: string;
  className?: string;
}>;

export function ExternalLink({ url, children = url.replace(/^https?:\/\//, ''), title, className }: ExternalLinkProps) {
  return (
    <a
      href={url}
      className={twMerge(`underline text-event-primary hover:text-event-hover ${className || ''}`)}
      title={title}
    >
      {children}
    </a>
  );
}
