import type { EventContext } from '@/schema/event';
import { logoBlackUrl, logoWhiteUrl } from '@/libs/urls';

type ThemeLogoProps = {
  event: EventContext;
  className?: string;
};

export function ThemeLogo({ event, className }: ThemeLogoProps) {
  return (
    <>
      <img src={logoBlackUrl(event)} alt="" className={className} data-theme-image="light" />
      <img src={logoWhiteUrl(event)} alt="" className={className} data-theme-image="dark" />
    </>
  );
}
