import { Logo } from '@/components/Logo';
import { FaAngleRight } from 'react-icons/fa6';

export function Banner({ Icon = Logo, title, subtitle, href, tooltip }) {
  return (
    <a
      href={href}
      className="flex gap-4 xl:p-12 md:p-8 p-4 items-center animate-border border-4 border-pgc-hover rounded-xl bg:pgc-gray hover:bg-pgc-hover transition-colors duration-300 hover:text-pgc-bg"
      title={tooltip}
    >
      <Icon className="size-12 md:size-16 xl:size-20" color="black"/>
      <div>
        <h3 className="text-lg font-bold md:text-xl xl:text-2xl">{title}</h3>
        <p>{subtitle}</p>
      </div>
      <FaAngleRight className="text-2xl md:text-4xl ml-auto"/>
    </a>
  );
}
