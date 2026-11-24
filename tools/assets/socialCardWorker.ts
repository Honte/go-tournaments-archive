import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderSocialCardJpeg, type SocialRenderRequest } from '@/libs/socialCards';

export type BuildSocialCardRequest = SocialRenderRequest & {
  outputPath: string;
};

export default async function buildSocialCardAsset({
  backgroundSrc,
  card,
  logo,
  outputPath,
}: BuildSocialCardRequest): Promise<string> {
  const jpeg = await renderSocialCardJpeg({ backgroundSrc, card, logo });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, jpeg);

  return outputPath;
}
