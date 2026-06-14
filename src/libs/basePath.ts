export function normalizeBasePath(basePath?: string) {
  if (!basePath || basePath === '/') {
    return '';
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}
