import Board from '@sabaki/go-board';
import { loadSgf } from '@/libs/sgf';

export function sgfToBoard(sgf: string) {
  const { size, moves } = loadSgf(sgf);

  let board = Board.fromDimensions(size);

  for (const { sign, vertex } of moves) {
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
