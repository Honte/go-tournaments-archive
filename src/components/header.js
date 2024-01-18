import { getTranslations } from '@/i18n/server';
// import { HiBars3 } from 'react-icons/hi2'
import { Logo } from '@/components/logo';
import Link from 'next/link';

export async function Header({ locale }) {
  const t = await getTranslations(locale);

  return (
    <header className="bg-pgc-dark text-pgc-light flex">
      <div className="container mx-auto flex h-16 items-center justify-center gap-3 md:gap-6 px-4 text-center">
        <Link href={`/${locale}`} className="group flex items-center gap-3 md:gap-4" title={t('navigation.home.title')}>
          <span className="sr-only">{t('navigation.home.anchor')}</span>
          <Logo className="h-8"/>
          <h1 className="flex-1 text-l xs:text-xl sm:text-2xl md:text-2xl line-clamp-2">
            {t('site.name')}
          </h1>
        </Link>
      </div>
    </header>
  )
}
