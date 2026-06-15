import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ApiGameInfo } from '@/schema/api';
import type { Game, Tournament } from '@/schema/data';
import type { EventConfig } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { generateJpg, generatePng } from '@tools/img';
import { Sgf } from '@tools/sgf';
import { generateSvg } from '@tools/svg';
import { getGameInfo, getSgfProps, getTournamentSgfZipPath } from '@/data/sgfs';

const THUMB_SIZE = 128;

export type BuildSgfRequest = {
  event: EventConfig;
  sgfDir: string;
  outputDir: string;
  game: Game;
  tournament: Tournament;
  translations: Translations;
};

export type BuildSgfResponse = {
  path: string;
  content: string;
  year: number;
  details: ApiGameInfo;
};

export default async function buildSgfAssets(input: BuildSgfRequest): Promise<BuildSgfResponse> {
  const { event, sgfDir, outputDir, game, tournament, translations } = input;
  const sgfYamlPath = game.props.sgf!;
  const relativePath = sgfYamlPath.replace(/^\/sgf\/?/, '');
  const sgfFilePath = path.join(sgfDir, relativePath);
  const outputPath = path.join(outputDir, relativePath);
  const content = await readFile(sgfFilePath, 'utf-8');
  const sgf = new Sgf(content);
  const targetProps = getSgfProps(event, game, tournament, translations);
  const cleaned = Sgf.clean(content, targetProps, game.rotation);

  const svg = await generateSvg(cleaned);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await Promise.all([
    saveFile(outputPath, cleaned),
    saveFile(outputPath.replace(/\.sgf$/, '.raw.sgf'), content),
    event.generateSvgs && saveFile(outputPath.replace(/\.sgf$/, '.svg'), svg),
    event.generatePngs && saveFile(outputPath.replace(/\.sgf$/, '.png'), generatePng(svg, THUMB_SIZE)),
    event.generateJpgs && saveFile(outputPath.replace(/\.sgf$/, '.jpg'), generateJpg(svg, THUMB_SIZE)),
  ]);

  return {
    year: tournament.year,
    path: getTournamentSgfZipPath(sgfYamlPath),
    content: cleaned,
    details: getGameInfo(sgf, game, tournament),
  };
}

async function saveFile(path: string, content: string | Promise<Buffer>) {
  await writeFile(path, await content);
}
