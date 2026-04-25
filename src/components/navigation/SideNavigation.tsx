'use client';

import EVENT_CONFIG from '@event/config';
import type { TournamentItem } from '@/schema/data';
import { clsx } from 'clsx';
import Link from 'next/link';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Hamburger } from '@/components/ui/Hamburger';
import { Overlay } from '@/components/ui/Overlay';

export type SideNavigationProps = {
  translations: Translations;
  tournaments: TournamentItem[];
};

export type NavigationLink = {
  key: string;
  href: string;
  label: ReactNode;
};

export type NavigationGroup = {
  key: string;
  label?: string;
  links: NavigationLink[];
  indented?: boolean;
};

export function SideNavigation({ translations, tournaments }: SideNavigationProps) {
  const [open, setOpen] = useState(false);
  const t = getTranslator(translations);
  const locale = translations.locale;

  const links = useMemo(() => {
    const groups: NavigationGroup[] = [];

    const main: NavigationLink[] = [
      {
        key: 'home',
        href: `/${locale}`,
        label: t('navigation.home.anchor'),
      },
      {
        key: 'stats',
        href: `/${locale}/stats`,
        label: t('site.allTimeStatsLink'),
      },
    ];

    if (EVENT_CONFIG.showCountry) {
      main.push({
        key: 'countries',
        href: `/${locale}/stats/country`,
        label: t('site.allTimeStatsByCountryLink'),
      });
    }

    groups.push({ key: 'main', links: main });

    if (EVENT_CONFIG.categories?.length) {
      groups.push({
        key: 'categories',
        label: t('navigation.categories'),
        indented: true,
        links: EVENT_CONFIG.categories.map((category) => ({
          key: `category-${category}`,
          href: `/${locale}/category/${category}`,
          label: t(`categories.short.${category}`),
        })),
      });
    }

    if (tournaments.length > 0) {
      groups.push({
        key: 'tournaments',
        label: t('navigation.tournaments'),
        indented: true,
        links: tournaments.toReversed().map((tournament) => {
          const location =
            EVENT_CONFIG.showCountry && tournament.country
              ? `${tournament.location}, ${tournament.country}`
              : tournament.location;

          return {
            key: `tournament-${tournament.year}`,
            href: `/${locale}/${tournament.year}`,
            label: (
              <div className="flex gap-1 items-baseline">
                {tournament.year}
                {location && <span className="text-xs text-event-gray group-hover:text-event-hover">{location}</span>}
              </div>
            ),
          };
        }),
      });
    }

    return groups;
  }, [locale, t, tournaments]);

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

  if (links.length === 0) {
    return null;
  }

  return (
    <>
      <Hamburger open={open} label={t(open ? 'navigation.closeMenu' : 'navigation.open')} onClick={toggleMenu} />
      <Overlay visible={open} onClick={closeMenu} className="top-12" />
      <aside
        className={clsx(
          'fixed left-0 top-12 bottom-0 z-30 flex w-[85%] max-w-sm flex-col bg-event-light text-event-dark shadow-xl transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2 overflow-y-auto">
            {links.map((group) => (
              <div key={group.key}>
                {group.label && (
                  <h3 className="text-xs uppercase tracking-wide text-event-dark mt-2 mb-1 first:mt-0">
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
                          'group block p-1 text-event-primary font-semibold underline hover:text-event-hover hover:bg-event-soft'
                        )}
                      >
                        {link.label}
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
