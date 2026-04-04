import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/Button';

type ExternalButtonProps = PropsWithChildren<{
  url: string;
  title?: string;
}>;

export function ExternalButton({ url, children, title }: ExternalButtonProps) {
  return (
    <a href={url} target="_blank" title={title}>
      <Button>{children}</Button>
    </a>
  );
}
