export type SgfNode = {
  id: number;
  parentId?: number;
  children: SgfNode[];
  data: SgfNodeData;
};

type SgfNodeDataChangeValueType = string | number | undefined | null;

export type SgfNodeDataChangeValue =
  | SgfNodeDataChangeValueType
  | SgfNodeDataChangeValueType[]
  | ((current: string[]) => SgfNodeDataChangeValueType | SgfNodeDataChangeValueType[]);

export type SgfNodeDataChange = Record<string, SgfNodeDataChangeValue>;
export type SgfNodeData = Record<string, string[]>;
