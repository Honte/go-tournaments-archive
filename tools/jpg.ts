import { generatePng } from '@tools/png';
import sharp from 'sharp';

export async function generateJpg(svg: string, width: number) {
  const png = await generatePng(svg, width);

  return sharp(png)
    .flatten({ background: '#ffffff' })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toBuffer();
}
