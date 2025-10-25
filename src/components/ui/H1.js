import { clsx } from 'clsx';

export function H1({ children, className }) {
  return (
    <h1 className={clsx('text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2', className)}>
      {children}
    </h1>
  );
}
