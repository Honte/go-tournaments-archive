import type { PropsWithChildren } from 'react';

export default function FakeLayoutToPreventNextSkipGeneratingStubs({ children }: PropsWithChildren) {
  return children;
}
