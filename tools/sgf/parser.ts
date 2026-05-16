import type { SgfNode } from './schema';

type ParsedSequence = {
  root: SgfNode;
  leaf: SgfNode;
};

export class SgfParser {
  private pos = 0;
  private nextId = 0;

  constructor(private readonly content: string) {}

  parse(): SgfNode {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      throw new Error('Expected SGF game tree');
    }

    const roots = this.peek() === '(' ? this.parseGameTree() : [this.parseUnwrappedGameTree()];

    this.skipWhitespace();

    while (this.peek() === '(') {
      this.parseGameTree();
      this.skipWhitespace();
    }

    if (!this.isAtEnd()) {
      throw new Error(`Unexpected token "${this.peek()}" at ${this.pos}`);
    }

    if (roots.length !== 1) {
      throw new Error(`Expected exactly one root game tree, found ${roots.length}`);
    }

    return roots[0];
  }

  private parseGameTree(): SgfNode[] {
    this.expect('(');
    this.skipWhitespace();

    if (this.peek() === ')') {
      this.expect(')');
      return [];
    }

    if (this.peek() === '(') {
      const roots: SgfNode[] = [];

      while (this.peek() === '(') {
        roots.push(...this.parseGameTree());
        this.skipWhitespace();
      }

      this.expect(')');
      return roots;
    }

    const sequence = this.parseSequence();
    this.skipWhitespace();

    while (this.peek() === '(') {
      sequence.leaf.children.push(...this.parseChildGameTree(sequence.leaf.id));
      this.skipWhitespace();
    }

    this.expect(')');

    return [sequence.root];
  }

  private parseUnwrappedGameTree(): SgfNode {
    const sequence = this.parseSequence();
    this.skipWhitespace();

    while (this.peek() === '(') {
      sequence.leaf.children.push(...this.parseChildGameTree(sequence.leaf.id));
      this.skipWhitespace();
    }

    return sequence.root;
  }

  private parseSequence(): ParsedSequence {
    if (this.peek() !== ';') {
      throw new Error(`Expected node at ${this.pos}`);
    }

    const root = this.parseNode();
    let leaf = root;

    this.skipWhitespace();

    while (this.peek() === ';') {
      const node = this.parseNode(leaf.id);
      leaf.children.push(node);
      leaf = node;
      this.skipWhitespace();
    }

    return { root, leaf };
  }

  private parseNode(parentId?: number): SgfNode {
    this.expect(';');
    this.skipWhitespace();

    const node: SgfNode = {
      id: this.nextId++,
      children: [],
      data: {},
    };

    if (parentId !== undefined) {
      node.parentId = parentId;
    }

    while (isIdentifierChar(this.peek())) {
      const rawIdentifier = this.readIdentifier();
      const identifier = rawIdentifier.toUpperCase();

      this.skipWhitespace();

      const values: string[] = [];

      while (this.peek() === '[') {
        values.push(this.readValue());
        this.skipWhitespace();
      }

      if (!values.length) {
        throw new Error(`Expected value for property ${rawIdentifier} at ${this.pos}`);
      }

      node.data[identifier] = [...(node.data[identifier] ?? []), ...values];
    }

    return node;
  }

  private parseChildGameTree(parentId: number): SgfNode[] {
    const children = this.parseGameTree();

    for (const child of children) {
      child.parentId = parentId;
    }

    return children;
  }

  private readIdentifier(): string {
    const start = this.pos;

    while (isIdentifierChar(this.peek())) {
      this.pos++;
    }

    return this.content.slice(start, this.pos);
  }

  private readValue(): string {
    this.expect('[');

    let value = '';

    while (!this.isAtEnd()) {
      const char = this.content[this.pos++];

      if (char === ']') {
        return value;
      }

      if (char === '\\') {
        if (this.isAtEnd()) {
          value += '\\';
          break;
        }

        const escaped = this.content[this.pos++];

        if (escaped === '\r') {
          if (this.peek() === '\n') {
            this.pos++;
          }

          continue;
        }

        if (escaped === '\n') {
          continue;
        }

        value += escaped;
        continue;
      }

      if (char === '\r') {
        if (this.peek() === '\n') {
          this.pos++;
        }

        value += '\n';
        continue;
      }

      value += char;
    }

    throw new Error('Unclosed property value');
  }

  private skipWhitespace(): void {
    while (isWhitespace(this.peek())) {
      this.pos++;
    }
  }

  private expect(expected: string): void {
    if (this.peek() !== expected) {
      throw new Error(`Expected "${expected}" at ${this.pos}`);
    }

    this.pos++;
  }

  private peek(): string {
    return this.content[this.pos] ?? '';
  }

  private isAtEnd(): boolean {
    return this.pos >= this.content.length;
  }
}

function isIdentifierChar(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}

function isWhitespace(char: string): boolean {
  return /^\s$/.test(char);
}
