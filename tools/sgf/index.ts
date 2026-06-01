import { MultipleGameBranchEndsError, MultipleLongestBranchesError } from './errors';
import { SgfParser } from './parser';
import type { SgfNode, SgfNodeDataChange } from './schema';
import { stringifySgf, type SgfStringifyLevel } from './stringify';

export type { SgfNode, SgfNodeData, SgfNodeDataChange } from './schema';
export type { SgfStringifyLevel } from './stringify';
export type SgfRotation = 0 | 90 | 180 | 270;

const ROTATABLE_PROPS = new Set(['B', 'W', 'AB', 'AW', 'AE']);
const SGF_ROTATIONS = new Set<SgfRotation>([0, 90, 180, 270]);

export class Sgf {
  private readonly root: SgfNode;
  private nodes = new Map<number, SgfNode>();

  static clean(content: string, props?: SgfNodeDataChange, rotation?: SgfRotation): string {
    return new Sgf(content)
      .stripVariations()
      .stripComments()
      .updateRootProperties(props)
      .rotate(rotation)
      .toString('compact');
  }

  static isValidRotation(number: number): number is SgfRotation {
    return SGF_ROTATIONS.has(number as SgfRotation);
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

  rotate(angle: SgfRotation = 0): this {
    if (!Sgf.isValidRotation(angle as number)) {
      throw new Error(`Unsupported SGF rotation angle: ${angle}`);
    }

    if (angle === 0) {
      return this;
    }

    const size = this.getNumericRootProperty('SZ') ?? 19;

    if (!Number.isInteger(size) || size <= 0) {
      throw new Error(`Unsupported SGF board size for rotation: ${this.getStringRootProperty('SZ')}`);
    }

    for (const node of this.iterateNodes()) {
      for (const [prop, values] of Object.entries(node.data)) {
        if (!ROTATABLE_PROPS.has(prop)) {
          continue;
        }

        node.data[prop] = values.map((value) => rotatePoint(value, size, angle));
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

  toString(level: SgfStringifyLevel = 'compact'): string {
    return stringifySgf(this.root, level);
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

function rotatePoint(value: string, size: number, angle: SgfRotation): string {
  if (!value) {
    return value;
  }

  const [start, end] = value.split(':');

  if (!end) {
    return rotateSinglePoint(start, size, angle);
  }

  const rotatedStart = parseRotatedPoint(start, size, angle);
  const rotatedEnd = parseRotatedPoint(end, size, angle);

  if (!rotatedStart || !rotatedEnd) {
    return value;
  }

  const minX = Math.min(rotatedStart.x, rotatedEnd.x);
  const minY = Math.min(rotatedStart.y, rotatedEnd.y);
  const maxX = Math.max(rotatedStart.x, rotatedEnd.x);
  const maxY = Math.max(rotatedStart.y, rotatedEnd.y);

  return `${encodePoint(minX, minY)}:${encodePoint(maxX, maxY)}`;
}

function rotateSinglePoint(value: string, size: number, angle: SgfRotation): string {
  const point = parseRotatedPoint(value, size, angle);

  return point ? encodePoint(point.x, point.y) : value;
}

function parseRotatedPoint(value: string, size: number, angle: SgfRotation): { x: number; y: number } | null {
  if (value.length !== 2) {
    return null;
  }

  // only [tt] is a valid pass move outside size
  if (size === 19 && value === 'tt') {
    return { x: size, y: size };
  }

  const x = value.charCodeAt(0) - 97;
  const y = value.charCodeAt(1) - 97;

  if (x < 0 || y < 0 || x >= size || y >= size) {
    throw new Error(`Unsupported position: ${value}`);
  }

  switch (angle) {
    case 90:
      return { x: size - 1 - y, y: x };
    case 180:
      return { x: size - 1 - x, y: size - 1 - y };
    case 270:
      return { x: y, y: size - 1 - x };
    case 0:
      return { x, y };
  }
}

function encodePoint(x: number, y: number): string {
  return `${String.fromCharCode(x + 97)}${String.fromCharCode(y + 97)}`;
}
