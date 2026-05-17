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
  moves: SgfMove[];
};

export type SgfMove = {
  sign: Sign;
  vertex: Vertex;
};

export function loadSgf(content: string, sgfPath?: string): SgfData {
  const root = new Sgf(content).getRoot();
  const moves: SgfMove[] = [];
  const result = root.data[SgfRootProps.GAME_RESULT]?.[0];

  let node = root.children[0];
  while (node) {
    const move = node.data?.B || node.data?.W;
    const position = move?.[0];

    if (position) {
      const [a, b] = position.split('');
      const x = a.charCodeAt(0) - 97;
      const y = b.charCodeAt(0) - 97;

      moves.push({
        sign: node.data.W ? -1 : 1,
        vertex: [x, y],
      });
    } else {
      // TODO handle pass
    }

    node = node.children?.[0];
  }

  return {
    title: toSingleString(root.data[SgfRootProps.GAME_NAME]),
    size: toSingleNumber(root.data[SgfRootProps.BOARD_SIZE]) ?? 19,
    komi: toSingleNumber(root.data[SgfRootProps.GAME_KOMI]),
    result: toSingleString(root.data[SgfRootProps.GAME_RESULT]),
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
