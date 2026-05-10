import type { Sign, Vertex } from '@sabaki/go-board';
import { parse, type SgfNode } from '@sabaki/sgf';
import type { GameProps } from '@/schema/data';
import { CustomSgfProps, SgfRootProps } from '@/schema/sgf';

export type SgfPlayer = {
  id?: string;
  name: string;
  rank?: string;
  country?: string;
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
  const [root] = parse(content);
  const moves: SgfMove[] = [];

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
    },
    white: {
      id: toSingleString(root.data[CustomSgfProps.WHITE_ID]),
      name: toSingleString(root.data[SgfRootProps.WHITE_NAME])!,
      rank: toSingleString(root.data[SgfRootProps.WHITE_RANK]),
      country: toSingleString(root.data[SgfRootProps.WHITE_TEAM]),
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

export function getLongestBranch(sgfTree: SgfNode[]) {
  const map = new Map<number, SgfNode>();
  const queue: [node: SgfNode, depth: number][] = sgfTree.map((node) => [node, 0]);
  const leafs: [node: SgfNode, depth: number][] = [];

  while (queue.length) {
    const [node, depth] = queue.shift()!;

    map.set(node.id, node);

    if (node.children?.length) {
      for (const child of node.children) {
        queue.push([child, depth + 1]);
      }
    } else {
      leafs.push([node, depth]);
    }
  }

  leafs.sort((a, b) => b[1] - a[1]);

  if (leafs.length > 1 && leafs[0][1] === leafs[1][1]) {
    console.warn('Multiple longest branches found');
  }

  const longest = [];
  let current: SgfNode | undefined = leafs[0][0];

  while (current) {
    longest.unshift(current);
    current = map.get(current.parentId!);
  }

  return longest;
}

function toSingleNumber(value?: string[]) {
  const num = Number(value?.[0]);

  return isNaN(num) ? undefined : num;
}

function toSingleString(value?: string[]) {
  return value?.[0];
}
