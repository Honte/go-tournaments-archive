import sharp from 'sharp';
import { generatePng } from '@tools/png';

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
