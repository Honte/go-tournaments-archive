import type { SgfRotation } from '@tools/sgf/schema';

export function rotatePoint(value: string, size: number, angle: SgfRotation): string {
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
