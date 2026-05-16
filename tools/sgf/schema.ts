export type SgfNode = {
  id: number;
  parentId?: number;
  children: SgfNode[];
  data: Record<string, string[]>;
};

export type SgfPropertyValue = string | string[] | ((current: string[]) => string | string[]);
