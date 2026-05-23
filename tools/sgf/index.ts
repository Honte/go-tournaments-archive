import { MultipleLongestBranchesError } from './errors';
import { SgfParser } from './parser';
import type { SgfNode, SgfNodeData } from './schema';

export type { SgfNode, SgfNodeData, SgfNodeDataValue } from './schema';

export class Sgf {
  private readonly root: SgfNode;
  private nodes = new Map<number, SgfNode>();

  static clean(content: string, props?: SgfNodeData): string {
    return new Sgf(content).stripShorterBranches().stripComments().updateRootProperties(props).toString(false);
  }

  constructor(content: string) {
    const parser = new SgfParser(content);
    this.root = parser.parse();

    this.nodes = new Map();
    for (const node of this.iterateNodes()) {
      this.nodes.set(node.id, node);
    }
  }

  stripComments(): this {
    for (const node of this.iterateNodes()) {
      delete node.data.C;
    }
    return this;
  }

  stripShorterBranches(): this {
    const longest = this.getLongestBranch();
    const branchIds = new Set(longest.map((node) => node.id));

    for (let i = 0; i < longest.length; i++) {
      const next = longest[i + 1];
      longest[i].children = next ? [next] : [];
    }

    const map = new Map();
    for (const node of this.iterateNodes()) {
      node.children = node.children.filter((child) => branchIds.has(child.id));
      map.set(node.id, node);
    }
    this.nodes = map;

    return this;
  }

  updateRootProperties(props?: SgfNodeData): this {
    if (!props) {
      return this;
    }

    for (const [prop, nextValue] of Object.entries(props)) {
      const current = this.root.data[prop] ?? [];
      const value = typeof nextValue === 'function' ? nextValue([...current]) : nextValue;
      const result = [];

      for (const item of Array.isArray(value) ? value : [value]) {
        if (item === null || item === undefined) {
          continue;
        }

        result.push(String(item));
      }

      if (result.length === 0) {
        delete this.root.data[prop];
      } else {
        this.root.data[prop] = result;
      }
    }

    return this;
  }

  getLongestBranch(): SgfNode[] {
    const queue: [node: SgfNode, depth: number][] = [[this.root, 0]];
    const leaves: [node: SgfNode, depth: number][] = [];

    while (queue.length) {
      const [node, depth] = queue.shift()!;

      if (node.children?.length) {
        for (const child of node.children) {
          queue.push([child, depth + 1]);
        }
      } else {
        leaves.push([node, depth]);
      }
    }

    leaves.sort((a, b) => b[1] - a[1]);

    if (leaves.length > 1 && leaves[0][1] === leaves[1][1]) {
      throw new MultipleLongestBranchesError(leaves[0][1] + 1);
    }

    const longest = [];
    let current: SgfNode | undefined = leaves[0][0];

    while (current) {
      longest.unshift(current);
      current = this.nodes.get(current.parentId!);
    }

    return longest;
  }

  getNode(id: number): SgfNode | undefined {
    return this.nodes.get(id);
  }

  getRoot(): SgfNode {
    return this.root;
  }

  toString(pretty = false): string {
    if (!pretty) {
      return `(${stringifyCompact(this.root)})`;
    }

    return ['(', ...stringifyPretty(this.root, 1), ')'].join('\n');
  }

  *iterateNodes(): Generator<SgfNode> {
    const queue = [this.root];

    while (queue.length) {
      const node = queue.shift()!;
      yield node;
      queue.push(...node.children);
    }
  }
}

function stringifyCompact(node: SgfNode): string {
  const current = stringifyNode(node);

  if (node.children.length === 0) {
    return current;
  }

  if (node.children.length === 1) {
    return current + stringifyCompact(node.children[0]);
  }

  return current + node.children.map((child) => `(${stringifyCompact(child)})`).join('');
}

function stringifyPretty(node: SgfNode, level: number): string[] {
  const indent = '  '.repeat(level);
  const lines = [`${indent}${stringifyNode(node)}`];

  if (node.children.length === 1) {
    lines.push(...stringifyPretty(node.children[0], level));
  } else {
    for (const child of node.children) {
      lines.push(`${indent}(`);
      lines.push(...stringifyPretty(child, level + 1));
      lines.push(`${indent})`);
    }
  }

  return lines;
}

function stringifyNode(node: SgfNode): string {
  let result = ';';

  for (const [identifier, values] of Object.entries(node.data)) {
    if (!/^[A-Z]+$/.test(identifier) || !values.length) {
      continue;
    }

    result += `${identifier}${values.map((value) => `[${escapeValue(value)}]`).join('')}`;
  }

  return result;
}

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}
