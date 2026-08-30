import { Inter } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import '@/globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

type BaseLayoutProps = PropsWithChildren<{
  locale: string;
}>;

export async function BaseLayout({ locale, children }: BaseLayoutProps) {
  return (
    <html lang={locale} className="min-h-full bg-archive-page" suppressHydrationWarning>
      <body className={`${inter.className} min-h-dvh flex flex-col text-archive-text`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
