import { getTranslations } from '@/i18n/server';

export async function Header({ locale }) {
  const t = await getTranslations(locale);

  return (
    <header className="bg-black text-white h-10 flex place-content-center place-items-center">
      <h1 className="container mx-auto text-2xl text-center truncate p-2">
        {t('header')}
      </h1>
    </header>
  )
}
