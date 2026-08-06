import type { PropsWithChildren } from 'react';
import { NavigationController } from '@/components/navigation/NavigationController';

export default function FakeLayoutToPreventNextSkipGeneratingStubs({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <NavigationController />
    </>
  );
}
