import type { SgfNode, SgfNodeData } from './schema';

export type SgfStringifyLevel = 'minified' | 'compact' | 'verbose';

const COMPACT_MOVE_LINE_LENGTH = 10;
const COMPACT_ROOT_GROUPS = [
  ['FF', 'CA', 'GM', 'SZ'],
  'GN',
  'EV',
  'PC',
  'RO',
  'DT',
  ['PB', 'BR', 'BT'],
  ['PW', 'WR', 'WT'],
  'RE',
  'KM',
  'RU',
  ['TM', 'OT', 'LT'],
  null,
  'AP',
  'GC',
];
const COMPACT_ROOT_GROUP_PROPS = new Set(
  COMPACT_ROOT_GROUPS.flatMap((group) => (group === null ? [] : typeof group === 'string' ? [group] : [...group]))
);

export function stringifySgf(node: SgfNode, level: SgfStringifyLevel = 'compact'): string {
  const stringifyLevel: string = level;

  switch (stringifyLevel) {
    case 'minified':
      return `(${stringifyMinified(node)})`;
    case 'compact':
      return `(${stringifyCompactSequence(node, true).join('\n')})`;
    case 'verbose':
      return ['(', ...stringifyVerbose(node, 1), ')'].join('\n');
    default:
      throw new Error(`Unsupported SGF stringify level: ${stringifyLevel}`);
  }
}

function stringifyMinified(node: SgfNode): string {
  const current = stringifyNode(node);

  if (node.children.length === 0) {
    return current;
  }

  if (node.children.length === 1) {
    return current + stringifyMinified(node.children[0]);
  }

  return current + node.children.map((child) => `(${stringifyMinified(child)})`).join('');
}

function stringifyCompactSequence(node: SgfNode, root = false): string[] {
  const lines: string[] = [];
  let current: SgfNode | undefined = node;
  let isRoot = root;

  while (current) {
    if (isRoot) {
      lines.push(...stringifyCompactRootNode(current));
      isRoot = false;
    } else if (isPureMoveNode(current)) {
      const { moveLines, next } = stringifyCompactMoveSequence(current);

      lines.push(...moveLines);
      current = next;
      continue;
    } else {
      lines.push(stringifyNode(current));
    }

    if (current.children.length === 1) {
      current = current.children[0];
    } else {
      lines.push(...stringifyCompactVariations(current.children));
      current = undefined;
    }
  }

  return lines;
}

function stringifyCompactRootNode(node: SgfNode): string[] {
  const emitted = new Set<string>();
  const lines: string[] = [];
  let isFirstGroup = true;

  for (const group of COMPACT_ROOT_GROUPS) {
    if (group === null) {
      lines.push(...stringifyCompactUnknownRootLines(node.data, emitted));
    } else {
      const props = typeof group === 'string' ? [group] : group;
      const line = stringifyCompactRootLine(node.data, emitted, props);

      if (isFirstGroup) {
        lines.push(`;${line}`);
      } else if (line) {
        lines.push(line);
      }
    }

    isFirstGroup = false;
  }

  return lines;
}

function stringifyCompactRootLine(data: SgfNodeData, emitted: Set<string>, props: readonly string[]): string {
  for (const prop of props) {
    emitted.add(prop);
  }

  return stringifyProperties(data, props);
}

function stringifyCompactUnknownRootLines(data: SgfNodeData, emitted: Set<string>): string[] {
  const lines: string[] = [];

  for (const [prop, values] of Object.entries(data)) {
    if (emitted.has(prop) || COMPACT_ROOT_GROUP_PROPS.has(prop)) {
      continue;
    }

    const property = stringifyProperty(prop, values);

    if (property) {
      lines.push(property);
    }
  }

  return lines;
}

function stringifyCompactMoveSequence(node: SgfNode): { moveLines: string[]; next?: SgfNode } {
  const nodes: SgfNode[] = [];
  let current: SgfNode | undefined = node;

  while (current && isPureMoveNode(current)) {
    nodes.push(current);

    if (current.children.length !== 1 || !isPureMoveNode(current.children[0])) {
      break;
    }

    current = current.children[0];
  }

  const moveLines = [];

  for (let i = 0; i < nodes.length; i += COMPACT_MOVE_LINE_LENGTH) {
    moveLines.push(
      nodes
        .slice(i, i + COMPACT_MOVE_LINE_LENGTH)
        .map(stringifyNode)
        .join('')
    );
  }

  const last = nodes[nodes.length - 1];

  if (last.children.length === 1) {
    return { moveLines, next: last.children[0] };
  }

  moveLines.push(...stringifyCompactVariations(last.children));

  return { moveLines };
}

function stringifyCompactVariations(children: SgfNode[]): string[] {
  return children.map((child) => {
    const lines = stringifyCompactSequence(child);

    lines[0] = `(${lines[0]}`;
    lines[lines.length - 1] += ')';

    return lines.join('\n');
  });
}

function isPureMoveNode(node: SgfNode): boolean {
  const props = Object.keys(node.data);

  return props.length === 1 && (props[0] === 'B' || props[0] === 'W') && !!node.data[props[0]]?.length;
}

function stringifyVerbose(node: SgfNode, level: number): string[] {
  const indent = '  '.repeat(level);
  const lines = [`${indent}${stringifyNode(node)}`];

  if (node.children.length === 1) {
    lines.push(...stringifyVerbose(node.children[0], level));
  } else {
    for (const child of node.children) {
      lines.push(`${indent}(`);
      lines.push(...stringifyVerbose(child, level + 1));
      lines.push(`${indent})`);
    }
  }

  return lines;
}

function stringifyNode(node: SgfNode): string {
  return `;${stringifyPropsInOriginalOrder(node.data)}`;
}

function stringifyPropsInOriginalOrder(data: SgfNodeData): string {
  let result = '';

  for (const [identifier, values] of Object.entries(data)) {
    result += stringifyProperty(identifier, values);
  }

  return result;
}

function stringifyProperties(data: SgfNodeData, props: readonly string[]): string {
  return props.map((prop) => stringifyProperty(prop, data[prop])).join('');
}

function stringifyProperty(identifier: string, values: string[] | undefined): string {
  if (!/^[A-Z]+$/.test(identifier) || !values?.length) {
    return '';
  }

  return `${identifier}${values.map((value) => `[${escapeValue(value)}]`).join('')}`;
}

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/]/g, '\\]');
}
