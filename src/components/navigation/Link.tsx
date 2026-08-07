'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { navigate } from '@/libs/navigation';

type NavigationLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  href: string;
};

export function Link({ href, onNavigate, prefetch = false, ...props }: NavigationLinkProps) {
  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      onNavigate={(event) => {
        let prevented = false;

        onNavigate?.({
          preventDefault() {
            prevented = true;
            event.preventDefault();
          },
        });

        if (!prevented && navigate(href) === 'history') {
          event.preventDefault();
        }
      }}
      {...props}
    />
  );
}
