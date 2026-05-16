export type SgfNode = {
  id: number;
  parentId?: number;
  children: SgfNode[];
  data: Record<string, string[]>;
};

type SgfNodeDataValueType = string | number | undefined | null;

export type SgfNodeDataValue =
  | SgfNodeDataValueType
  | SgfNodeDataValueType[]
  | ((current: string[]) => SgfNodeDataValueType | SgfNodeDataValueType[]);

export type SgfNodeData = Record<string, SgfNodeDataValue>;
