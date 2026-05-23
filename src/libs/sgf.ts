import type { Sign, Vertex } from '@sabaki/go-board';
import type { GameProps } from '@/schema/data';
import { CustomSgfProps, SgfRootProps } from '@/schema/sgf';
import { Sgf } from '@tools/sgf';

export type SgfPlayer = {
  id?: string;
  name: string;
  rank?: string;
  country?: string;
  won?: boolean;
};

export type SgfData = {
  size: number;
  komi?: number;
  title?: string;
  result?: string;
  black: SgfPlayer;
  white: SgfPlayer;
  props?: GameProps;
  moves: (SgfMove | SgfEdit)[];
};

export type SgfMove = {
  sign: Sign;
  vertex: Vertex;
};

export type SgfEdit = {
  empty: Vertex[];
  white: Vertex[];
  black: Vertex[];
};

export function loadSgf(content: string, sgfPath?: string): SgfData {
  const sgf = new Sgf(content);
  const result = sgf.getStringRootProperty(SgfRootProps.GAME_RESULT);
  const size = sgf.getNumericRootProperty(SgfRootProps.BOARD_SIZE) ?? 19;

  const moves: (SgfMove | SgfEdit)[] = [];
  let node = sgf.getRoot().children[0];
  while (node) {
    const move = node.data?.B || node.data?.W;
    const empty = node.data?.AE;
    const white = node.data?.AW;
    const black = node.data?.AB;

    if (move) {
      const position = move?.[0];
      const vertex: Vertex = position ? moveToVertex(position) : [size, size];

      moves.push({
        sign: node.data.W ? -1 : 1,
        vertex,
      });
    }

    if (empty || white || black) {
      moves.push({
        empty: empty?.map(moveToVertex) ?? [],
        white: white?.map(moveToVertex) ?? [],
        black: black?.map(moveToVertex) ?? [],
      });
    }

    node = node.children?.[0];
  }

  return {
    title: sgf.getStringRootProperty(SgfRootProps.GAME_NAME),
    size,
    result,
    komi: sgf.getNumericRootProperty(SgfRootProps.GAME_KOMI),
    black: {
      id: sgf.getStringRootProperty(CustomSgfProps.BLACK_ID),
      name: sgf.getStringRootProperty(SgfRootProps.BLACK_NAME)!,
      rank: sgf.getStringRootProperty(SgfRootProps.BLACK_RANK),
      country: sgf.getStringRootProperty(SgfRootProps.BLACK_TEAM),
      won: result?.startsWith('B'),
    },
    white: {
      id: sgf.getStringRootProperty(CustomSgfProps.WHITE_ID),
      name: sgf.getStringRootProperty(SgfRootProps.WHITE_NAME)!,
      rank: sgf.getStringRootProperty(SgfRootProps.WHITE_RANK),
      country: sgf.getStringRootProperty(SgfRootProps.WHITE_TEAM),
      won: result?.startsWith('W'),
    },
    props: {
      sgf: sgfPath,
      ai: sgf.getStringRootProperty(CustomSgfProps.GAME_AI),
      ogs: sgf.getStringRootProperty(CustomSgfProps.GAME_OGS),
      yt: sgf.getRootProperty(CustomSgfProps.GAME_YT),
    },
    moves,
  };
}

function moveToVertex(position: string) {
  const [a, b] = position.split('');
  const x = a.charCodeAt(0) - 97;
  const y = b.charCodeAt(0) - 97;

  return [x, y] as Vertex;
}
