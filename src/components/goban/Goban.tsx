import type { default as Board, Sign, Vertex } from '@sabaki/go-board';
import { MouseEvent, useRef } from 'react';
import { iterateStones } from '@/libs/goban';
import type { SgfMove } from '@/libs/sgf';
import SVG_BLACK from './black.svg';
import SVG_BOARD from './board.svg';
import SVG_WHITE from './white.svg';

export type SgfPointer = SgfMove & {
  hint: string;
};

export type GobanProps = {
  className?: string;
  board: Board;
  mark?: Vertex;
  pointer?: SgfPointer;
  onClick?: (move: SgfMove, svg: SVGSVGElement) => void;
  onMouseMove?: (move: SgfMove, svg: SVGSVGElement) => void;
};

export function Goban({ className, board, mark, pointer, onClick, onMouseMove }: GobanProps) {
  const size = board.width; // always assume board is square
  const lastTriggered = useRef<Vertex>(undefined);

  let path = '';
  for (let i = 1; i <= size; i++) {
    path += `M${i} 1L${i} ${size}M1 ${i}L${size} ${i}`;
  }

  // add hoshi points for 19x19
  if (size === 19) {
    for (const x of [4, 10, 16]) {
      for (const y of [4, 10, 16]) {
        path += `M${x} ${y}m-.08 0a.08 .08 0 1 0 .16 0a.08 .08 0 1 0 -.16 0`;
      }
    }
  }

  return (
    // oxlint-disable-next-line jsx_a11y/no-static-element-interactions oxlint-disable-next-line jsx_a11y/click-events-have-key-events
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size + 1} ${size + 1}`}
      onMouseMove={(ev) => {
        if (typeof onMouseMove !== 'function') {
          return;
        }

        const vertex = getVertex(ev, size);

        if (
          vertex[0] >= 0 &&
          vertex[1] >= 0 &&
          vertex[0] < size &&
          vertex[1] < size &&
          !isSameVertex(vertex, lastTriggered.current)
        ) {
          onMouseMove({ sign: (board.get(vertex) ?? 0) as Sign, vertex }, ev.currentTarget);
          lastTriggered.current = vertex;
          ev.stopPropagation();
        }
      }}
      onClick={(ev) => {
        if (typeof onClick !== 'function') {
          return;
        }

        const vertex = getVertex(ev, size);

        if (vertex[0] >= 0 && vertex[1] >= 0 && vertex[0] < size && vertex[1] < size) {
          onClick({ sign: (board.get(vertex) ?? 0) as Sign, vertex }, ev.currentTarget);
          ev.stopPropagation();
        }
      }}
    >
      <defs>
        <image
          id="black"
          href={SVG_BLACK.src}
          width={SVG_BLACK.width}
          height={SVG_BLACK.height}
          transform="translate(.515 .55)"
        />
        <image
          id="white"
          href={SVG_WHITE.src}
          transform="translate(.525 .58)"
          width={SVG_WHITE.width}
          height={SVG_WHITE.height}
        />
      </defs>
      <image x="0" y="0" width={size + 1} height={size + 1} href={SVG_BOARD.src} />
      <path d={path} stroke="black" strokeWidth=".02" strokeLinejoin="round" />

      {Array.from(iterateStones(board)).map((move) => (
        <Stone key={toKey(move)} {...move} />
      ))}

      {pointer?.hint && (
        <>
          <rect
            x={pointer.vertex[0] + 0.5}
            y={pointer.vertex[1]}
            width={1}
            height={0.5}
            opacity={0.5}
            rx={0.1}
            ry={0.1}
            className="fill-black pointer-events-none"
          />
          <text
            x={pointer.vertex[0] + 1}
            y={pointer.vertex[1] + 0.4}
            textAnchor="middle"
            className="text-[.4px] fill-white pointer-events-none"
          >
            {pointer.hint}
          </text>
        </>
      )}
      {pointer && <Stone {...pointer} className="opacity-50 pointer-events-none" />}

      {mark && (
        <circle
          cx={mark[0] + 1}
          cy={mark[1] + 1}
          r=".28"
          className="fill-transparent stroke-red-500 stroke-[0.1px] pointer-events-none"
        />
      )}
    </svg>
  );
}

function Stone(props: SgfMove & { className?: string }) {
  const {
    sign,
    vertex: [x, y],
    className,
  } = props;

  return <use x={x} y={y} href={`#${sign === -1 ? 'white' : 'black'}`} className={className} />;
}

function toKey(move: SgfMove) {
  return `${move.vertex[0]}-${move.vertex[1]}`;
}

function getVertex(ev: MouseEvent, size: number): Vertex {
  const rect = ev.currentTarget.getBoundingClientRect();
  const width = rect.width / (size + 1);
  const height = rect.height / (size + 1);

  return [Math.round((ev.clientX - rect.left) / width) - 1, Math.round((ev.clientY - rect.top) / height) - 1];
}

function isSameVertex(a?: Vertex, b?: Vertex) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}
