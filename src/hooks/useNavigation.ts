'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import {
  getNavigationLocation,
  getNavigationState,
  getServerNavigationState,
  subscribeToNavigation,
} from '@/libs/navigation';

export function useNavigation() {
  return useSyncExternalStore(subscribeToNavigation, getNavigationState, getServerNavigationState);
}

export function useNavigationSearchParams() {
  const pathname = usePathname();
  const navigation = useNavigation();

  return new URLSearchParams(getNavigationLocation(navigation, pathname)?.searchParams);
}
