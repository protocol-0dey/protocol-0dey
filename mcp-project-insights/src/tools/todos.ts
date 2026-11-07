import path from 'node:path';
import { readTextFile, walkFiles } from '../fs-safe.js';

export interface TodoItem {
  file: string;
  line: number;
  tag: string;
  text: string;
}

export interface TodoReport {
  total: number;
  byTag: Record<string, number>;
  items: TodoItem[];
  /** True when more items exist than `limit`, or the file walk hit its cap. */
  truncated: boolean;
}

const SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.vue',
  '.svelte',
  '.html',
];
const MARKER = /(?:\/\/|\/\*|\*|#|<!--)\s*(TODO|FIXME|HACK|XXX)\b[:\s(-]*(.*)/;

export async function findTodos(dir: string, limit = 50): Promise<TodoReport> {
  const { files, truncated: walkTruncated } = await walkFiles(dir, SOURCE_EXTENSIONS);
  const byTag: Record<string, number> = {};
  const items: TodoItem[] = [];
  let total = 0;

  for (const file of files) {
    const text = await readTextFile(file);
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const match = MARKER.exec(lines[i] ?? '');
      if (!match) continue;
      const tag = match[1] as string;
      total++;
      byTag[tag] = (byTag[tag] ?? 0) + 1;
      if (items.length < limit) {
        items.push({
          file: path.relative(dir, file).split(path.sep).join('/'),
          line: i + 1,
          tag,
          text: (match[2] ?? '')
            .replace(/\*\/|-->/g, '')
            .trim()
            .slice(0, 200),
        });
      }
    }
  }

  return { total, byTag, items, truncated: total > items.length || walkTruncated };
}
