import type { TournamentItem } from '@/schema/data';
import Link from 'next/link';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getSitemap } from '@/data/sitemap';
import { LocaleNavigation } from '@/components/navigation/LocaleNavigation';
import { SideNavigation } from '@/components/navigation/SideNavigation';

type TopBarProps = {
  translations: Translations;
  tournaments: TournamentItem[];
};

export function Header({ translations, tournaments }: TopBarProps) {
  const t = getTranslator(translations);
  const locale = translations.locale;
  const sitemap = getSitemap(tournaments, translations);

  return (
    <header className="shrink-0 z-40 bg-event-dark text-event-light">
      <div className="container mx-auto max-w-(--breakpoint-2xl) flex h-12 items-center gap-3 px-4">
        <SideNavigation
          sitemap={sitemap}
          strings={{
            open: t('navigation.open'),
            close: t('navigation.close'),
          }}
        />
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 md:gap-3 min-w-0"
          title={t('navigation.home.title')}
          prefetch={false}
        >
          <span className="sr-only">{t('navigation.home.anchor')}</span>
          <img src="/logo-white.svg" alt="" className="h-4 xs:h-5 shrink-0" />
          <span className="text-base xs:text-lg font-semibold truncate">
            {t('navigation.archiveLabel', t('site.acronym'))}
          </span>
        </Link>
        <LocaleNavigation locale={locale} />
      </div>
    </header>
  );
}
