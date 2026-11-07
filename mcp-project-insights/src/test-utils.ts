import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Creates a throwaway project on disk from a { relativePath: contents } map. */
export async function makeProject(files: Record<string, string>): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'insights-'));
  for (const [name, contents] of Object.entries(files)) {
    const full = path.join(dir, name);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, contents);
  }
  return dir;
}

export const bigComponent = (lines: number) =>
  `export function Big() {\n  return null;\n}\n` +
  Array.from({ length: lines }, (_, i) => `// line ${i}`).join('\n');
