export type SgfNode = {
  id: number;
  parentId?: number;
  children: SgfNode[];
  data: Record<string, string[]>;
};

export type SgfNodeDataValue =
  | string
  | string[]
  | number
  | null
  | ((current: string[]) => string | number | string[] | null);

export type SgfNodeData = Record<string, SgfNodeDataValue>;
