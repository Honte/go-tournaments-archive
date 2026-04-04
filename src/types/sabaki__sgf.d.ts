declare module '@sabaki/sgf' {
  interface SgfNode {
    id: number;
    parentId?: number;
    data: Record<string, string[]>;
    children: SgfNode[];
  }

  interface ParseOptions {
    getId?: () => number;
    dictionary?: Record<number, SgfNode>;
    onProgress?: (progress: { percent: number }) => void;
    onNodeCreated?: (info: { node: SgfNode }) => void;
  }

  interface StringifyOptions {
    linebreak?: string;
    indent?: string;
    level?: number;
  }

  function parse(contents: string, options?: ParseOptions): SgfNode[];
  function parseTokens(tokens: unknown[], options?: ParseOptions): SgfNode[];
  function parseBuffer(buffer: Buffer, options?: ParseOptions): SgfNode[];
  function parseFile(path: string, options?: ParseOptions): SgfNode[];
  function stringify(node: SgfNode | SgfNode[], options?: StringifyOptions): string;
  function tokenize(contents: string): unknown[];
  function tokenizeBuffer(buffer: Buffer): unknown[];

  const sgf: {
    parse: typeof parse;
    parseTokens: typeof parseTokens;
    parseBuffer: typeof parseBuffer;
    parseFile: typeof parseFile;
    stringify: typeof stringify;
    tokenize: typeof tokenize;
    tokenizeBuffer: typeof tokenizeBuffer;
  };

  export default sgf;
  export { parse, parseTokens, parseBuffer, parseFile, stringify, tokenize, tokenizeBuffer };
  export type { SgfNode, ParseOptions, StringifyOptions };
}
