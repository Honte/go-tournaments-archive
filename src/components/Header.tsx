import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { homeUrl, logoWhiteUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { LocaleNavigation } from '@/components/navigation/LocaleNavigation';
import { SideNavigation } from '@/components/navigation/SideNavigation';

type TopBarProps = {
  event: EventContext;
  translations: Translations;
};

export function Header({ event, translations }: TopBarProps) {
  const t = getTranslator(translations);
  const locale = translations.locale;

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-event-dark text-event-light">
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
        <LocaleNavigation locale={locale} locales={event.locales} />
      </div>
    </header>
  );
}
