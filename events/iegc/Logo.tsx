import type { LogoProps } from '@event/schema';
import { readFile } from 'node:fs/promises';

export async function Logo({ mode: _mode, ...props }: LogoProps) {
  const logo = await readFile('./events/iegc/logo.png', 'base64');

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <image href={`data:image/png;base64,${logo}`} />
    </svg>
  );
}
