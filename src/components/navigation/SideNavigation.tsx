'use client';

import { useSitemapData } from '@/hooks/useSitemapData';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/i18n/consts';
import { Hamburger } from '@/components/ui/Hamburger';
import { Overlay } from '@/components/ui/Overlay';

export type SideNavigationProps = {
  locale: Locale;
  strings: {
    open: string;
    close: string;
  };
};

export function SideNavigation({ locale, strings }: SideNavigationProps) {
  const { data: sitemap, isPending } = useSitemapData(locale);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  if (!isPending && !sitemap?.length) {
    return null;
  }

  return (
    <>
      <Hamburger open={open} label={open ? strings.close : strings.open} onClick={toggleMenu} />
      <Overlay visible={open} onClick={closeMenu} className="top-12" />
      <aside
        className={clsx(
          'fixed left-0 top-12 bottom-0 z-30 flex w-[85%] max-w-sm flex-col bg-event-light text-event-dark shadow-xl transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-2 overflow-y-auto">
            {sitemap?.map((group) => (
              <div key={group.key}>
                {group.label && (
                  <h3 className="text-xs uppercase tracking-wide text-event-dark mt-2 mb-1 first:mt-0 pl-2">
                    {group.label}
                  </h3>
                )}
                <ul
                  className={clsx('flex flex-col', {
                    'pl-4': group.indented,
                  })}
                >
                  {group.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        prefetch={false}
                        onClick={closeMenu}
                        className={clsx(
                          'group flex gap-1 items-baseline py-1 px-2 text-event-primary font-semibold underline hover:text-event-hover hover:bg-gray-300 rounded-sm'
                        )}
                      >
                        {link.label}
                        {link.description && (
                          <span className="text-xs text-event-gray group-hover:text-event-hover">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
