import { Inter } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import '@/globals.css';

const inter = Inter({ subsets: ['latin'] });

type BaseLayoutProps = PropsWithChildren<{
  locale: string;
}>;

export async function BaseLayout({ locale, children }: BaseLayoutProps) {
  return (
    <html lang={locale} className="min-h-full bg-event-light">
      <body className={`${inter.className} min-h-dvh flex flex-col text-event-dark`}>{children}</body>
    </html>
  );
}
