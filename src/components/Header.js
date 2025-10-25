import Link from 'next/link';
import { getTranslator } from '@/i18n/translator';
import { Logo } from '@/components/Logo';

export async function Header({ translations }) {
  const t = getTranslator(translations);

  return (
    <header className="bg-pgc-dark text-pgc-light flex">
      <div className="container mx-auto max-w-(--breakpoint-2xl) flex h-16 items-center justify-center gap-3 md:gap-6 px-4 text-center">
        <Link
          href={`/${translations.locale}`}
          className="group flex items-center gap-3 md:gap-4"
          title={t('navigation.home.title')}
        >
          <span className="sr-only">{t('navigation.home.anchor')}</span>
          <Logo className="h-8" color="white" />
          <h1 className="flex-1 text-l xs:text-xl sm:text-2xl md:text-2xl line-clamp-2">{t('site.name')}</h1>
        </Link>
      </div>
    </header>
  );
}
