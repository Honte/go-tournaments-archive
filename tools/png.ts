import { createConverter } from 'convert-svg-to-png';
import { executablePath } from 'puppeteer';

let converter: Awaited<ReturnType<typeof createConverter>> | undefined;

export async function generatePng(svg: string, width: number, height = width) {
  converter ||= await createConverter({
    launch: { executablePath, args: process.env.CI ? ['--no-sandbox'] : [] },
  });

  return converter.convert(svg, {
    width,
    height,
  });
}
