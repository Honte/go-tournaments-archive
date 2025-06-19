import { Logo } from '@/components/logo';
import { FaAngleRight } from 'react-icons/fa6';

export function Banner({ Icon = Logo, title, subtitle, href, tooltip }) {
  return (
    <a href={href}
       className="flex gap-4 xl:p-12 md:p-8 p-4 rounded-xl items-center bg-gray-300 hover:text-pgc-light [background:linear-gradient(45deg,var(--color-gray-300),var(--color-gray-300))_padding-box,conic-gradient(from_var(--border-angle),var(--color-gray-300)_80%,--theme(--color-pgc-hover/.8)_86%,var(--color-pgc-hover)_90%,var(--color-pgc-hover)_94%,var(--color-gray-300))_border-box] border-4 border-transparent animate-border hover:[background:var(--color-pgc-hover)]"
       title={tooltip}>
      <Icon className="size-12 md:size-16 xl:size-20" color="black"/>
      <div>
        <h3 className="text-lg font-bold md:text-xl xl:text-2xl">{title}</h3>
        <p>{subtitle}</p>
      </div>
      <FaAngleRight className="text-2xl md:text-4xl ml-auto"/>
    </a>
  );
}
