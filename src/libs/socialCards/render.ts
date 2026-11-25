import { ImageResponse } from 'next/og';
import { createElement } from 'react';
import sharp from 'sharp';
import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from '@/libs/metadata';
import { loadSocialFonts } from './assets';
import type { SocialRenderRequest } from './schema';
import { SocialCard } from './SocialCard';

export async function renderSocialCardJpeg(request: SocialRenderRequest): Promise<Buffer> {
  const fonts = await loadSocialFonts();
  const response = new ImageResponse(createElement(SocialCard, request), {
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    fonts,
  });
  const pngBuffer = Buffer.from(await response.arrayBuffer());

  return sharp(pngBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}
