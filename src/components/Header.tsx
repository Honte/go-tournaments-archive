import Link from 'next/link';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Endpoints } from '@/libs/endpoints';
import { LocaleNavigation } from '@/components/navigation/LocaleNavigation';
import { SideNavigation } from '@/components/navigation/SideNavigation';

type TopBarProps = {
  locales: Locale[];
  translations: Translations;
};

export function Header({ translations, locales }: TopBarProps) {
  const t = getTranslator(translations);
  const locale = translations.locale;

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-event-dark text-event-light">
      <div className="container mx-auto max-w-(--breakpoint-2xl) flex h-12 items-center gap-3 px-4">
        <SideNavigation
          locale={translations.locale}
          strings={{
            open: t('navigation.openMenu'),
            close: t('navigation.closeMenu'),
          }}
        />
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 md:gap-3 min-w-0"
          title={t('navigation.home.title')}
          prefetch={false}
        >
          <span className="sr-only">{t('navigation.home.anchor')}</span>
          <img src={Endpoints.LOGO_WHITE()} alt="" className="h-4 xs:h-5 shrink-0" />
          <span className="text-base xs:text-lg font-semibold truncate">
            {t('navigation.archiveLabel', t('site.acronym'))}
          </span>
        </Link>
        <LocaleNavigation locale={locale} locales={locales} />
      </div>
    </header>
  );
}
