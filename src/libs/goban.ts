import Board from '@sabaki/go-board';
import { loadSgf, type SgfMove } from '@/libs/sgf';

export function sgfToBoard(sgf: string) {
  const { size, moves } = loadSgf(sgf);

  let board = Board.fromDimensions(size);

  for (const move of moves) {
    if ('sign' in move) {
      board = board.makeMove(move.sign, move.vertex);
    } else {
      for (const vertex of move.empty) {
        board = board.set(vertex, 0);
      }

      for (const vertex of move.black) {
        board = board.set(vertex, 1);
      }

      for (const vertex of move.white) {
        board = board.set(vertex, -1);
      }
    }
  }

  return board;
}

export function* iterateStones(board: Board) {
  for (const [y, row] of board.signMap.entries()) {
    for (const [x, color] of row.entries()) {
      if (color !== 0) {
        yield { sign: color, vertex: [x, y] } satisfies SgfMove;
      }
    }
  }
}
