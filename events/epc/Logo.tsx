import type { LogoProps } from '@/schema/event';
import { Logo as EuropeanLogo } from '../egc/Logo';

export function Logo(props: LogoProps) {
  return EuropeanLogo({ variant: 'epc', ...props });
}
