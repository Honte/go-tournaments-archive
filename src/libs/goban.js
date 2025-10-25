import Board from '@sabaki/go-board';

const SIZE_REGEX = /[\];]SZ\[(?<size>\d{1,2})]/;
const MOVE_REGEX = /;(?<color>B|W)\[(?<position>[a-z]{2})]/g;

export function sgfToBoard(sgf) {
  const sizeMatch = sgf.match(SIZE_REGEX);
  let board = Board.fromDimensions(sizeMatch ? Number(sizeMatch.groups.size) : 19);

  // assume there's no variations!
  for (const {
    groups: { color, position },
  } of iterateMatches(sgf, MOVE_REGEX)) {
    const [a, b] = position.split('');
    const x = a.charCodeAt(0) - 97;
    const y = b.charCodeAt(0) - 97;

    board = board.makeMove(color === 'W' ? -1 : 1, [x, y]);
  }

  return board;
}

export function* iterateStones(board) {
  for (const [y, row] of board.signMap.entries()) {
    for (const [x, color] of row.entries()) {
      if (color !== 0) {
        yield [x, y, color];
      }
    }
  }
}

function* iterateMatches(input, regex) {
  let result;
  do {
    result = regex.exec(input);
    if (result) {
      yield result;
    }
  } while (result);
}
