import { MultipleGameBranchEndsError, MultipleLongestBranchesError } from './errors';
import { SgfParser } from './parser';
import type { SgfNode, SgfNodeData, SgfNodeDataChange } from './schema';

export type { SgfNode, SgfNodeData, SgfNodeDataChange };

export class Sgf {
  private readonly root: SgfNode;
  private nodes = new Map<number, SgfNode>();

  static clean(content: string, props?: SgfNodeDataChange): string {
    return new Sgf(content).stripVariations().stripComments().updateRootProperties(props).toString(false);
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

  stripVariations(): this {
    const gameBranch = this.getGameBranch();
    const branchIds = new Set(gameBranch.map((node) => node.id));

    for (let i = 0; i < gameBranch.length; i++) {
      const next = gameBranch[i + 1];
      gameBranch[i].children = next ? [next] : [];
    }

    const map = new Map<number, SgfNode>();
    for (const node of this.iterateNodes()) {
      node.children = node.children.filter((child) => branchIds.has(child.id));
      map.set(node.id, node);
    }
    this.nodes = map;

    return this;
  }

  getRootProperty(key: string): string[] | undefined {
    return this.root.data[key];
  }

  getStringRootProperty(key: string): string | undefined {
    return this.getRootProperty(key)?.[0];
  }

  getNumericRootProperty(key: string): number | undefined {
    const value = this.getStringRootProperty(key);

    return value ? Number(value) : undefined;
  }

  updateRootProperties(props?: SgfNodeDataChange): this {
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

    return this.getBranchToNode(leaves[0][0]);
  }

  getBranchToNode(node: number | SgfNode): SgfNode[] {
    let target: SgfNode;

    if (typeof node === 'number') {
      const found = this.nodes.get(node);

      if (!found) {
        throw new Error(`SGF node ${node} not found`);
      }

      target = found;
    } else {
      target = node;
    }

    const branch: SgfNode[] = [];
    let current: SgfNode | undefined = target;

    while (current) {
      branch.unshift(current);
      current = this.nodes.get(current.parentId!);
    }

    return branch;
  }

  getGameBranch(): SgfNode[] {
    const queue: [node: SgfNode, depth: number][] = [[this.root, 0]];
    const endNodes: SgfNode[] = [];
    const leaves: [node: SgfNode, depth: number][] = [];

    while (queue.length) {
      const [node, depth] = queue.shift()!;

      if (node.data.N?.includes('END')) {
        endNodes.push(node);
      }

      if (node.children.length) {
        for (const child of node.children) {
          queue.push([child, depth + 1]);
        }
      } else {
        leaves.push([node, depth]);
      }
    }

    if (endNodes.length > 1) {
      throw new MultipleGameBranchEndsError(endNodes.length);
    }

    if (endNodes.length === 1) {
      return this.getBranchToNode(endNodes[0]);
    }

    leaves.sort((a, b) => b[1] - a[1]);

    if (leaves.length > 1 && leaves[0][1] === leaves[1][1]) {
      throw new MultipleLongestBranchesError(leaves[0][1] + 1);
    }

    return this.getBranchToNode(leaves[0][0]);
  }

  getMainBranch(): SgfNode[] {
    const branch: SgfNode[] = [];
    let current: SgfNode | undefined = this.root;

    while (current) {
      branch.push(current);
      current = current.children[0];
    }

    return branch;
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
