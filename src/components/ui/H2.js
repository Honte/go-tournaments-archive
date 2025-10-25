import { clsx } from 'clsx';

export function H2({ children, className }) {
  return <h1 className={clsx('text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2', className)}>{children}</h1>;
}
