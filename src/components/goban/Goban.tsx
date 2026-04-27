import type { default as Board, Vertex } from '@sabaki/go-board';
import { iterateStones } from '@/libs/goban';
import BLACK from './black.svg';
import BOARD from './board.svg';
import WHITE from './white.svg';

// NOTE: Next's `next/image-types/global` declares `module '*.svg'` as `any` to
// avoid conflicts with SVGR. That causes imported SVGs to appear as `any` in the
// IDE even though at runtime Next returns an object with `{ src, width, height }`.
// To restore IntelliSense locally (without changing global declarations), we
// cast the three imports to a strongly-typed shape used in this component only.
type StaticSvg = { src: string; width: number; height: number };

const SVG_BLACK = BLACK as unknown as StaticSvg;
const SVG_BOARD = BOARD as unknown as StaticSvg;
const SVG_WHITE = WHITE as unknown as StaticSvg;

export type GobanProps = {
  className?: string;
  board: Board;
  mark?: Vertex;
};

export function Goban({ className, board, mark }: GobanProps) {
  const w = board.width;
  const h = board.height;

  let path = '';
  for (let i = 1; i <= w; i++) {
    path += `M${i} 1L${i} ${h}`;
  }
  for (let j = 1; j <= h; j++) {
    path += `M1 ${j}L${w} ${j}`;
  }

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w + 1} ${h + 1}`}>
      <defs>
        <image id="black" href={SVG_BLACK.src} transform="translate(.51 .52)" />
        <image id="white" href={SVG_WHITE.src} transform="translate(.53 .52)" />
      </defs>
      <image x="0" y="0" width={w + 1} height={h + 1} href={SVG_BOARD.src} />
      <path d={path} stroke="black" strokeWidth=".02" strokeLinejoin="round" />

      {Array.from(iterateStones(board)).map(({ sign, vertex: [x, y] }) => (
        <use key={`${x}-${y}`} x={x} y={y} href={`#${sign === -1 ? 'white' : 'black'}`} />
      ))}

      {mark && (
        <circle cx={mark[0] + 1} cy={mark[1] + 1} r=".3" className="fill-transparent stroke-red-500 stroke-[0.1px]" />
      )}
    </svg>
  );
}
