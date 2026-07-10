import type { ComponentProps } from 'react';
import { Header } from '@/components/ui/Header';

type H2Props = Omit<ComponentProps<typeof Header>, 'level'>;

export function H2(props: H2Props) {
  return <Header level={2} {...props} />;
}
