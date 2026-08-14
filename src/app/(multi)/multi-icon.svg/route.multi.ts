import { readFile } from 'node:fs/promises';

export const dynamic = 'force-static';

export async function GET() {
  const svg = await readFile('./src/assets/archives.svg', 'utf-8');

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}
