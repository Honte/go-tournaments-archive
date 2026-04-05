import { Logo } from '@event/Logo';
import type { ComponentType } from 'react';
import { FaAngleRight } from 'react-icons/fa6';

type BannerProps = {
  Icon?: ComponentType<{ className?: string; color?: string }>;
  title: string;
  subtitle?: string;
  href: string;
  tooltip?: string;
};

export function Banner({ Icon = Logo, title, subtitle, href, tooltip }: BannerProps) {
  return (
    <a
      href={href}
      className="flex gap-4 xl:p-12 md:p-8 p-4 items-center animate-border border-4 border-event-hover rounded-xl bg:event-gray hover:bg-event-hover transition-colors duration-300 hover:text-event-bg"
      title={tooltip}
    >
      <Icon className="size-12 md:size-16 xl:size-20" color="black" />
      <div>
        <h3 className="text-lg font-bold md:text-xl xl:text-2xl">{title}</h3>
        <p>{subtitle}</p>
      </div>
      <FaAngleRight className="text-2xl md:text-4xl ml-auto" />
    </a>
  );
}
