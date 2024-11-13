import sgfParser from '@sabaki/sgf';

export function cleanSgf(content, rootParams) {
  const rootNodes = sgfParser.parse(content);

  const leafs = [];
  const map = new Map();
  let branches = rootNodes.map((node) => [node, 0]);

  while (branches.length) {
    const [branch, depth] = branches.shift();

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
    const parent = map.get(current.parentId);

    current = cleanNode(parent, [current])
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

    current.data = Object.fromEntries(Object.entries(current.data).sort((a, b) => a[0].localeCompare(b[0])))
  }

  return sgfParser.stringify(current);
}

function cleanNode(node, newChildren) {
  const result = {
    ...node,
    data: {
      ...node.data
    },
    children: newChildren
  };

  if ('C' in result.data) {
    delete result.data.C
  }

  return result;
}
