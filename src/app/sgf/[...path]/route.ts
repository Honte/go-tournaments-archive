import EVENT from '@event';
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import type { NextRequest } from 'next/server';

const SGF_DIR = `./events/${EVENT}/sgf`;

const CONTENT_TYPES: Record<string, string> = {
  '.sgf': 'application/x-go-sgf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, props: RouteProps) {
  const { path: segments } = await props.params;
  const filePath = path.join(SGF_DIR, ...segments);

  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(SGF_DIR))) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const content = await fs.readFile(resolved);
    const ext = path.extname(resolved);
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    return new Response(content, {
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}

export async function generateStaticParams() {
  const files = await fg.glob(`${SGF_DIR}/**/*.{sgf,svg,png}`);

  return files.map((f) => ({
    path: path.relative(SGF_DIR, f).split('/'),
  }));
}
