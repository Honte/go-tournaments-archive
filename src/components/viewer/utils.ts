type SearchParamsLike = {
  toString(): string;
};

export function getOpenViewerSearch(searchParams: SearchParamsLike, sgfPath: string): string {
  const params = new URLSearchParams(searchParams.toString());

  params.set('sgf', sgfPath);

  return `?${params.toString()}`;
}

export function getClosedViewerSearch(searchParams: SearchParamsLike): string {
  const params = new URLSearchParams(searchParams.toString());

  params.delete('sgf');

  return params.size ? `?${params.toString()}` : '';
}
