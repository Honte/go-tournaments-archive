import { twMerge } from 'tailwind-merge'

export function ExternalLink({
  url,
  children = url.replace(/^https?:\/\//, ''),
  title,
  className
}) {
  return (
    <a
      href={url}
      className={twMerge(`underline text-pgc-primary hover:text-pgc-hover ${className || ''}`)}
      title={title}
    >
      {children}
    </a>
  );
}
