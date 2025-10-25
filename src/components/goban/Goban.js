import { useMemo } from 'react';
import { iterateStones, sgfToBoard } from '@/libs/goban';
import SVG_BLACK from './black.svg';
import SVG_BOARD from './board.svg';
import SVG_WHITE from './white.svg';

export function Goban({ className, sgf }) {
  const board = useMemo(() => sgfToBoard(sgf), [sgf]);
  const stepV = SVG_BOARD.width / (board.width + 1);
  const stepH = SVG_BOARD.height / (board.height + 1);
  const linesV = Array.from({ length: board.width }).map((_, i) => ({
    x1: stepV * (i + 1),
    y1: stepH,
    x2: stepV * (i + 1),
    y2: SVG_BOARD.height - stepH,
  }));
  const linesH = Array.from({ length: board.height }).map((_, i) => ({
    y1: stepH * (i + 1),
    x1: stepV,
    y2: stepH * (i + 1),
    x2: SVG_BOARD.width - stepV,
  }));
  const lines = linesV.concat(linesH);

  const stones = useMemo(() => {
    if (!board) {
      return [];
    }

    const result = [];
    for (const [x, y, color] of iterateStones(board)) {
      result.push([(x + 1) * stepV - stepV / 2, (y + 1) * stepH - stepH / 2, color]);
    }

    return result;
  }, [stepH, stepV, board]);

  if (!sgf) {
    return null;
  }

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SVG_BOARD.width} ${SVG_BOARD.height}`}
    >
      <image x="0" y="0" width={SVG_BOARD.width} height={SVG_BOARD.height} href={SVG_BOARD.src} />
      {lines.map((line, index) => (
        <line key={index} {...line} stroke="black" strokeWidth="2" />
      ))}
      {stones.map(([x, y, color], index) => (
        <image
          key={index}
          x={x}
          y={y}
          href={color === -1 ? SVG_WHITE.src : SVG_BLACK.src}
          width={stepV}
          height={stepH}
        />
      ))}
    </svg>
  );
}
