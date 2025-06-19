import { loadTournaments } from '@/data/load';
import { createConverter } from 'convert-svg-to-png';
import { executablePath } from 'puppeteer';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { iterateStones, sgfToBoard } from '@/components/goban/board';

const boardSvg = await readFile('./src/components/goban/board.svg');
const whiteSvg = await readFile('./src/components/goban/white.svg');
const blackSvg = await readFile('./src/components/goban/black.svg');
const tournaments = await loadTournaments();
const converter = await createConverter({
  launch: { executablePath }
});

await generateImages()
await converter.close()
console.log('Done')

async function generateImages() {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game?.props?.sgf) {
        const sgf = game.props.sgf
          .replace(process.env.SGF_URL_PREFIX, '')
          .replace(`${tournament.year}/`, '');

        await generateImage(`./public/sgf/${tournament.year}/${sgf}`);
      }
    }
  }
}

async function generateImage(file) {
  if (!existsSync(file)) {
    console.log(`File ${file} not found`)
    return
  }

  const target = file.replace('.sgf', '.png')
  const content = await readFile(file, 'utf-8');
  const board = sgfToBoard(content);

  const stepV = 1024 / (board.width + 1);
  const stepH = 1024 / (board.height + 1);
  const linesV = Array.from({ length: board.width })
    .map((_, i) => ({ x1: stepV * (i + 1), y1: stepH, x2: stepV * (i + 1), y2: 1024 - stepH }));
  const linesH = Array.from({ length: board.height })
    .map((_, i) => ({ y1: stepH * (i + 1), x1: stepV, y2: stepH * (i + 1), x2: 1024 - stepV }));
  const lines = linesV.concat(linesH);

  const stones = [];
  for (const [x, y, color] of iterateStones(board)) {
    stones.push([
      (x + 1) * stepV - (stepV / 2),
      (y + 1) * stepH - (stepH / 2),
      color
    ]);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <g id="white" transform="scale(0.05)">${whiteSvg}</g>
    <g id="black" transform="scale(0.05)">${blackSvg}</g>
  </defs>
  ${boardSvg}
  ${lines.map(({
    x1,
    x2,
    y1,
    y2
  }) => `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="black" stroke-width="2"></line>`).join('')}
  ${stones.map(([x, y, color]) => `<use xlink:href="#${color === -1 ? 'white' : 'black'}" transform="translate(${x}, ${y})"/>`)}
</svg>;`;

  const png = await converter.convert(svg, {
    width: 1024,
    height: 1024
  });

  await writeFile(target, png);
  console.log('Done', target);
}
