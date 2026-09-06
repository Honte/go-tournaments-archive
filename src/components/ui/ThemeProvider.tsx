import { ThemeProvider as WrkszThemeProvider } from '@wrksz/themes/next';
import type { PropsWithChildren } from 'react';

export async function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <WrkszThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storage="localStorage"
      storageKey="go-tournaments-theme"
    >
      {children}
    </WrkszThemeProvider>
  );
}
