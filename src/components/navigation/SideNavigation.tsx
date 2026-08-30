'use client';

import { clsx } from 'clsx';
import { Fragment, useCallback, useEffect, useState } from 'react';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { Link } from '@/components/navigation/Link';
import { Hamburger } from '@/components/ui/Hamburger';
import { Overlay } from '@/components/ui/Overlay';
import { useSitemapData } from '@/hooks/useSitemapData';

export type SideNavigationProps = {
  event: EventContext;
  locale: Locale;
  strings: {
    open: string;
    close: string;
  };
};

export function SideNavigation({ event, locale, strings }: SideNavigationProps) {
  const { data: sitemap, isPending } = useSitemapData(event, locale);
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
          'fixed left-0 top-12 bottom-0 z-30 flex w-[85%] max-w-sm flex-col bg-archive-surface text-archive-text shadow-xl transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col overflow-y-auto">
            {sitemap?.map((group) => (
              <Fragment key={group.key}>
                {group.label && (
                  <h3 className="text-xs uppercase tracking-wide text-archive-text mt-2 first:mt-0 mb-1 pl-2">
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
                        title={link.tooltip}
                        onClick={closeMenu}
                        className={clsx(
                          'group flex gap-1 items-baseline py-1 px-2 text-archive-accent font-semibold underline hover:text-archive-accent-hover hover:bg-archive-surface-hover rounded-sm'
                        )}
                      >
                        {link.label}
                        {link.description && (
                          <span className="text-xs text-archive-text-muted group-hover:text-archive-accent-hover">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
