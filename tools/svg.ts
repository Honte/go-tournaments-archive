import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { cleanSgf } from '@tools/sgf';
import { optimize } from 'svgo';
import { iterateStones, sgfToBoard } from '@/libs/goban';

const boardSvg = await readFile('./src/components/goban/board.svg', 'utf-8');
const whiteSvg = await readFile('./src/components/goban/white.svg', 'utf-8');
const blackSvg = await readFile('./src/components/goban/black.svg', 'utf-8');

export async function generateSvg(sgfFile: string) {
  if (!existsSync(sgfFile)) {
    console.log(`File ${sgfFile} not found`);
    return;
  }

  const content = await readFile(sgfFile, 'utf-8');
  const board = sgfToBoard(cleanSgf(content));

  const w = board.width + 1;
  const h = board.height + 1;

  let path = '';
  for (let i = 1; i <= board.width; i++) {
    path += `M${i} 1L${i} ${board.height}`;
  }
  for (let j = 1; j <= board.height; j++) {
    path += `M1 ${j}L${board.width} ${j}`;
  }

  const stones = [];
  for (const [x, y, color] of iterateStones(board)) {
    stones.push(`<use href="#${color === -1 ? 'WHITE' : 'BLACK'}" x="${x}" y="${y}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <g id="WHITE" transform="translate(.5 .5)">${stripSvg(whiteSvg)}</g>
    <g id="BLACK" transform="translate(.5 .5)">${stripSvg(blackSvg)}</g>
  </defs>
  ${stripSvg(boardSvg)}
  <path stroke-width="0.02" stroke="black" d="${path}" stroke-linejoin="round"/>
  ${stones.join('')}
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

function stripSvg(svg: string) {
  return svg.replace(/<svg[^>]*>|<\/svg>/g, '');
}
