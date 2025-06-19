import { loadTournaments } from '@/data/load';
import { createConverter } from 'convert-svg-to-png';
import { executablePath } from 'puppeteer';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { generateSvg } from './svg';

const SIZE = 512

const tournaments = await loadTournaments();
const converter = await createConverter({
  launch: { executablePath }
});

await generatePngs();
await converter.close();
console.log('Done');

async function generatePngs() {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game?.props?.sgf) {
        const sgf = game.props.sgf
          .replace(process.env.SGF_URL_PREFIX, '')
          .replace(`${tournament.year}/`, '');

        await generatePng(`./public/sgf/${tournament.year}/${sgf}`);
      }
    }
  }
}

async function generatePng(file) {
  const targetPng = file.replace('.sgf', '.png');
  const targetSvg = file.replace('.sgf', '.svg');

  if (!existsSync(file)) {
    console.log(`File ${file} not found`);
    return;
  }

  const svg = await (existsSync(targetSvg) ? readFile(targetSvg) : generateSvg(file));
  const png = await converter.convert(svg, {
    width: SIZE,
    height: SIZE
  });

  await writeFile(targetPng, png);
  console.log('Saved PNG', targetPng);
}
