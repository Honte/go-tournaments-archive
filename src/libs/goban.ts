import Board, { type Sign, type Vertex } from '@sabaki/go-board';

const SIZE_REGEX = /[\];]SZ\[(?<size>\d{1,2})]/;
const MOVE_REGEX = /;(?<color>B|W)\[(?<position>[a-z]{2})]/g;

export type SgfMove = { sign: Sign; vertex: Vertex };

export function sgfToMoves(sgf: string) {
  const result: SgfMove[] = [];

  // assume there are no variations!
  for (const { groups } of iterateMatches(sgf, MOVE_REGEX)) {
    const { color, position } = groups!;
    const [a, b] = position.split('');
    const x = a.charCodeAt(0) - 97;
    const y = b.charCodeAt(0) - 97;

    result.push({ sign: color === 'W' ? -1 : 1, vertex: [x, y] });
  }

  return result;
}

export function sgfToBoard(sgf: string) {
  const sizeMatch = sgf.match(SIZE_REGEX);
  let board = Board.fromDimensions(sizeMatch ? Number(sizeMatch.groups!.size) : 19);

  for (const { sign, vertex } of sgfToMoves(sgf)) {
    board = board.makeMove(sign, vertex);
  }

  return board;
}

export function* iterateStones(board: Board) {
  for (const [y, row] of board.signMap.entries()) {
    for (const [x, color] of row.entries()) {
      if (color !== 0) {
        yield { sign: color, vertex: [x, y] };
      }
    }
  }
}

function* iterateMatches(input: string, regex: RegExp) {
  let result: RegExpExecArray | null;

  do {
    result = regex.exec(input);
    if (result) {
      yield result;
    }
  } while (result);
}
