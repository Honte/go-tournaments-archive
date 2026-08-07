'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { Link } from '@/components/navigation/Link';
import { Button } from '@/components/ui/Button';
import { getGameViewerSearch } from '@/components/viewer/utils';
import { useSearchParamHref } from '@/hooks/useSearchParamHref';

type GameButtonProps = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type' | 'onClick'> & {
    sgfPath: string;
  }
>;

export function GameViewerButton({ sgfPath, children, ...props }: GameButtonProps) {
  const href = useSearchParamHref(getGameViewerSearch, sgfPath);

  return (
    <Link href={href}>
      <Button {...props}>{children}</Button>
    </Link>
  );
}
