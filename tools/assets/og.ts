import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderOgCardJpeg, type OgRenderRequest } from '@/libs/og';

export type BuildOgRequest = OgRenderRequest & {
  outputPath: string;
};

export default async function buildOgAsset({ backgroundSrc, card, logo, outputPath }: BuildOgRequest): Promise<string> {
  const jpeg = await renderOgCardJpeg({ backgroundSrc, card, logo });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, jpeg);

  return outputPath;
}
