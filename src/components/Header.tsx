import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { homeUrl, logoWhiteUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { LocaleNavigation } from '@/components/navigation/LocaleNavigation';
import { SideNavigation } from '@/components/navigation/SideNavigation';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';

type TopBarProps = {
  event: EventContext;
  translations: Translations;
};

export function Header({ event, translations }: TopBarProps) {
  const t = getTranslator(translations);
  const locale = translations.locale;

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-archive-shell text-archive-shell-text">
      <div className="container mx-auto max-w-(--breakpoint-2xl) flex h-12 items-center gap-3 px-4">
        <SideNavigation
          event={event}
          locale={translations.locale}
          strings={{
            open: t('navigation.openMenu'),
            close: t('navigation.closeMenu'),
          }}
        />
        <Link
          href={homeUrl(event, locale)}
          className="flex items-center gap-2 md:gap-3 min-w-0"
          title={t('navigation.home.title')}
        >
          <span className="sr-only">{t('navigation.home.anchor')}</span>
          <img src={logoWhiteUrl(event)} alt="" className="h-4 xs:h-5 shrink-0" />
          <span className="text-base xs:text-lg font-semibold truncate">
            {t('navigation.archiveLabel', t('site.acronym'))}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <LocaleNavigation
            strategy="param"
            locale={locale}
            locales={event.locales}
            strings={{
              label: t('navigation.locale'),
            }}
          />
          <ThemeSwitch
            strings={{
              label: t('navigation.theme.label'),
              auto: t('navigation.theme.auto'),
              light: t('navigation.theme.light'),
              dark: t('navigation.theme.dark'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
