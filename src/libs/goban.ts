import Board from '@sabaki/go-board';

const SIZE_REGEX = /[\];]SZ\[(?<size>\d{1,2})]/;
const MOVE_REGEX = /;(?<color>B|W)\[(?<position>[a-z]{2})]/g;

export function sgfToBoard(sgf: string) {
  const sizeMatch = sgf.match(SIZE_REGEX);
  let board = Board.fromDimensions(sizeMatch ? Number(sizeMatch.groups!.size) : 19);

  // assume there are no variations!
  for (const { groups } of iterateMatches(sgf, MOVE_REGEX)) {
    const { color, position } = groups!;
    const [a, b] = position.split('');
    const x = a.charCodeAt(0) - 97;
    const y = b.charCodeAt(0) - 97;

    board = board.makeMove(color === 'W' ? -1 : 1, [x, y]);
  }

  return board;
}

export function* iterateStones(board: Board) {
  for (const [y, row] of board.signMap.entries()) {
    for (const [x, color] of row.entries()) {
      if (color !== 0) {
        yield [x, y, color];
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
