import type { ComponentProps } from 'react';
import { Header } from '@/components/ui/Header';

type H1Props = Omit<ComponentProps<typeof Header>, 'level'>;

export function H1(props: H1Props) {
  return <Header level={1} {...props} />;
}
