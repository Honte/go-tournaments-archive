import { Logo } from '@/components/logo';
import { FaAngleRight } from 'react-icons/fa6';

export function Banner({ Icon = Logo, title, subtitle, href, tooltip }) {
  return (
    <a href={href} className="flex gap-4 xl:p-12 md:p-8 p-4 bg-gray-300 rounded items-center hover:bg-pgc-hover hover:text-pgc-light" title={tooltip}>
      <Icon className="size-12 md:size-16 xl:size-20" color="black"/>
      <div>
        <h3 className="text-lg font-bold md:text-xl xl:text-2xl">{title}</h3>
        <p>{subtitle}</p>
      </div>
      <FaAngleRight className="text-2xl md:text-4xl ml-auto"/>
    </a>
  );
}
