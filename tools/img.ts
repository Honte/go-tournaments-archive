import sharp from 'sharp';

export async function generateJpg(svg: string, width: number) {
  return sharp(Buffer.from(svg))
    .resize({ width })
    .flatten({ background: '#ffffff' })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toBuffer();
}

export async function generatePng(svg: string, width: number) {
  return sharp(Buffer.from(svg)).resize({ width }).flatten({ background: '#ffffff' }).png().toBuffer();
}
