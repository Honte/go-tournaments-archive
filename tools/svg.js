import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { iterateStones, sgfToBoard } from '@/components/goban/board';
import { optimize } from 'svgo';

const SIZE = 1024;
const STONE_SCALE = 0.055;

const boardSvg = await readFile('./src/components/goban/board.svg');
const whiteSvg = await readFile('./src/components/goban/white.svg');
const blackSvg = await readFile('./src/components/goban/black.svg');

export async function generateSvg(sgfFile) {
  if (!existsSync(sgfFile)) {
    console.log(`File ${sgfFile} not found`);
    return;
  }

  const content = await readFile(sgfFile, 'utf-8');
  const board = sgfToBoard(content);

  const stepV = SIZE / (board.width + 1);
  const stepH = SIZE / (board.height + 1);

  let path = '';
  for (let i = 0; i < board.width; i++) {
    const x = stepH * (i + 1);

    path += `M${x} ${stepV}`;
    path += `L${x} ${SIZE - stepV}`;
  }
  for (let j = 0; j < board.height; j++) {
    const y = stepV * (j + 1);

    path += `M${stepH} ${y}`;
    path += `L${SIZE - stepH} ${y}`;
  }

  const stones = [];
  for (const [x, y, color] of iterateStones(board)) {
    stones.push([(x + 1) * stepV - stepV / 2, (y + 1) * stepH - stepH / 2, color]);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <g id="WHITE" transform="scale(${STONE_SCALE})">${whiteSvg}</g>
    <g id="BLACK" transform="scale(${STONE_SCALE})">${blackSvg}</g>
  </defs>
  ${boardSvg}
  <path stroke-width="2" stroke="black" d="${path}"/>
  ${stones.map(([x, y, color]) => `<use href="#${color === -1 ? 'WHITE' : 'BLACK'}" transform="translate(${x}, ${y})"/>`).join('')}
</svg>`;

  return optimize(svg, {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            collapseGroups: false, // this breaks svg to png conversion for some reason
          },
        },
      },
      'removeXlink',
    ],
  }).data;
}
