import { readFile } from 'node:fs/promises';
import type { LogoProps } from '@/schema/event';

export async function Logo({ mode: _mode, ...props }: LogoProps) {
  const logo = await readFile('./events/nlk/logo.png', 'base64');

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 233 160" {...props}>
      <image href={`data:image/png;base64,${logo}`} />
    </svg>
  );
}
