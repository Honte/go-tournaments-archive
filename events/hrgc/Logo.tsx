import { readFile } from 'node:fs/promises';
import type { LogoProps } from '../schema';

export async function Logo({ mode: _mode, ...props }: LogoProps) {
  const logo = await readFile('./events/hrgc/logo.png', 'base64');

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 781 781" {...props}>
      <image href={`data:image/png;base64,${logo}`} />
    </svg>
  );
}
