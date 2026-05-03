export const NORMALIZED_BASE_PATH = normalizeBasePath(process.env.BASE_PATH);

export function normalizeBasePath(value: string | undefined) {
  if (!value || value === '/') {
    return '';
  }

  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}
