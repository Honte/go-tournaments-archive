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
  const root = new Sgf(content).getRoot();
  const result = toSingleString(root.data[SgfRootProps.GAME_RESULT]);
  const size = toSingleNumber(root.data[SgfRootProps.BOARD_SIZE]) ?? 19;

  const moves: (SgfMove | SgfEdit)[] = [];
  let node = root.children[0];
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
    title: toSingleString(root.data[SgfRootProps.GAME_NAME]),
    size,
    result,
    komi: toSingleNumber(root.data[SgfRootProps.GAME_KOMI]),
    black: {
      id: toSingleString(root.data[CustomSgfProps.BLACK_ID]),
      name: toSingleString(root.data[SgfRootProps.BLACK_NAME])!,
      rank: toSingleString(root.data[SgfRootProps.BLACK_RANK]),
      country: toSingleString(root.data[SgfRootProps.BLACK_TEAM]),
      won: result?.startsWith('B'),
    },
    white: {
      id: toSingleString(root.data[CustomSgfProps.WHITE_ID]),
      name: toSingleString(root.data[SgfRootProps.WHITE_NAME])!,
      rank: toSingleString(root.data[SgfRootProps.WHITE_RANK]),
      country: toSingleString(root.data[SgfRootProps.WHITE_TEAM]),
      won: result?.startsWith('W'),
    },
    props: {
      sgf: sgfPath,
      ai: toSingleString(root.data[CustomSgfProps.GAME_AI]),
      ogs: toSingleString(root.data[CustomSgfProps.GAME_OGS]),
      yt: root.data[CustomSgfProps.GAME_YT],
    },
    moves,
  };
}

function toSingleNumber(value?: string[]) {
  const num = Number(value?.[0]);

  return isNaN(num) ? undefined : num;
}

function toSingleString(value?: string[]) {
  return value?.[0];
}

function moveToVertex(position: string) {
  const [a, b] = position.split('');
  const x = a.charCodeAt(0) - 97;
  const y = b.charCodeAt(0) - 97;

  return [x, y] as Vertex;
}
