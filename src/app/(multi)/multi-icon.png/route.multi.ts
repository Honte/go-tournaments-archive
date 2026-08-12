import { readFile } from 'node:fs/promises';
import { generatePng } from '@tools/img';

export const dynamic = 'force-static';

export async function GET() {
  const svg = await readFile('./src/assets/archives.svg', 'utf-8');

  return new Response(await generatePng(svg, 180), {
    headers: { 'Content-Type': 'image/png' },
  });
}
