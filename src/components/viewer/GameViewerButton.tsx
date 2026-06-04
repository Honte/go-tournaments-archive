import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/Button';
import { GameViewerLink } from '@/components/viewer/GameViewerLink';

export function GameViewerButton({
  sgfPath,
  children,
  ...props
}: Omit<ComponentProps<'button'>, 'onClick'> & {
  sgfPath: string;
}) {
  return (
    <GameViewerLink sgfPath={sgfPath}>
      <Button {...props}>{children}</Button>
    </GameViewerLink>
  );
}
