'use client';

import { getNavigationLocation } from '@/libs/navigation';
import { useNavigation } from '@/hooks/useNavigation';

export function useSearchParamHref<T extends unknown[]>(
  updater: (params: URLSearchParams, ...args: T) => URLSearchParams,
  ...args: T
) {
  const navigation = useNavigation();
  const current = getNavigationLocation(navigation);
  const nextParams = updater(new URLSearchParams(current?.searchParams), ...args);

  return `${current?.pathname}${nextParams.size ? `?${nextParams.toString()}` : ''}`;
}
