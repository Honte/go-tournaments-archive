import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  loadArchiveLogoAsset,
  loadEventBackgroundDataUri,
  loadEventLogoAsset,
  loadGenericBackgroundDataUri,
  renderSocialCardJpeg,
  type SocialCardSpec,
} from '@/libs/socialCards';

sharp.concurrency(1);

export type BuildSocialCardRequest = {
  eventId?: string;
  card: SocialCardSpec;
  outputPath: string;
};

export default async function buildSocialCardAsset({
  eventId,
  card,
  outputPath,
}: BuildSocialCardRequest): Promise<string> {
  const [backgroundSrc, logo] = eventId
    ? await Promise.all([loadEventBackgroundDataUri(eventId), loadEventLogoAsset(eventId)])
    : await Promise.all([loadGenericBackgroundDataUri(), loadArchiveLogoAsset()]);
  const jpeg = await renderSocialCardJpeg({ backgroundSrc, card, logo });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, jpeg);

  return outputPath;
}
