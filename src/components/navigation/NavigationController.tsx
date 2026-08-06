'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { completeNavigation } from '@/libs/navigation';
import { useNavigation } from '@/hooks/useNavigation';

export function NavigationController() {
  const pathname = usePathname();
  const { target } = useNavigation();

  useLayoutEffect(() => {
    if (!target || target.pathname !== pathname) {
      return;
    }

    completeNavigation(target);
  }, [pathname, target]);

  return null;
}
