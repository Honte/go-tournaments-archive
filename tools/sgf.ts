import sgfParser, { SgfNode } from '@sabaki/sgf';

type RootParamValue = string | number | null | ((prev?: string) => string | number | null);
export type RootParams = Record<string, RootParamValue>;

export function cleanSgf(content: string, rootParams?: RootParams): string {
  const rootNodes = sgfParser.parse(content) as SgfNode[];

  const leafs: [SgfNode, number][] = [];
  const map = new Map<number, SgfNode>();
  let branches: [SgfNode, number][] = rootNodes.map((node) => [node, 0]);

  while (branches.length) {
    const [branch, depth] = branches.shift()!;

    map.set(branch.id, branch);

    for (const child of branch.children) {
      if (child.children?.length) {
        branches.push([child, depth + 1]);
      } else {
        leafs.push([child, depth + 1]);
      }
    }
  }

  const farthestLeaf = leafs.sort((a, b) => b[1] - a[1])[0][0];

  let current = cleanNode(farthestLeaf, []);

  while (typeof current.parentId === 'number') {
    const parent = map.get(current.parentId)!;

    current = cleanNode(parent, [current]);
  }

  if (rootParams) {
    for (const param in rootParams) {
      let value = rootParams[param];

      if (typeof value === 'function') {
        value = value(current.data[param]?.[0]);
      }

      if (value === null && param in current.data) {
        delete current.data[param];
      } else if (value) {
        current.data[param] = [String(value)];
      }
    }

    current.data = Object.fromEntries(Object.entries(current.data).sort((a, b) => a[0].localeCompare(b[0])));
  }

  return sgfParser.stringify(current, {
    linebreak: '',
    indent: '',
  });
}

function cleanNode(node: SgfNode, newChildren: SgfNode[]): SgfNode {
  const result: SgfNode = {
    ...node,
    data: {
      ...node.data,
    },
    children: newChildren,
  };

  if ('C' in result.data) {
    delete result.data.C;
  }

  return result;
}
