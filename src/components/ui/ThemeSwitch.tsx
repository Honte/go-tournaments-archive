'use client';

import { useTheme } from '@wrksz/themes/client';
import { useMemo } from 'react';
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import { HeaderSwitch, type HeaderSwitchOption } from '@/components/ui/HeaderSwitch';

export type ThemeSwitchStrings = {
  label: string;
  auto: string;
  light: string;
  dark: string;
};

type ThemeSwitchProps = {
  strings: ThemeSwitchStrings;
};

export function ThemeSwitch({ strings }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();

  const options: HeaderSwitchOption[] = useMemo(
    () => [
      {
        value: 'system',
        label: strings.auto,
        content: <LuMonitor aria-hidden="true" />,
        onSelect: () => setTheme('system'),
      },
      {
        value: 'light',
        label: strings.light,
        content: <LuSun aria-hidden="true" />,
        onSelect: () => setTheme('light'),
      },
      {
        value: 'dark',
        label: strings.dark,
        content: <LuMoon aria-hidden="true" />,
        onSelect: () => setTheme('dark'),
      },
    ],
    [strings, setTheme]
  );

  return <HeaderSwitch label={strings.label} current={theme} options={options} />;
}
