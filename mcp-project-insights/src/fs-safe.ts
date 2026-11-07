import { promises as fs } from 'node:fs';
import path from 'node:path';

export const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.turbo',
  '.cache',
  'playwright-report',
  'test-results',
]);

/** Hard limits so a huge repository can never make a tool call slow or flood the model's context. */
export const MAX_FILES = 5000;
export const MAX_FILE_BYTES = 512 * 1024;

export class PathError extends Error {}

/**
 * Resolves `relative` against `root` and refuses anything that escapes it, including via `..`
 * and symlinks. Every tool goes through this function, which is what makes the server safe to
 * point at a real working directory.
 */
export async function resolveInside(root: string, relative = '.'): Promise<string> {
  const realRoot = await fs.realpath(root);
  const target = path.resolve(realRoot, relative);
  let realTarget: string;
  try {
    realTarget = await fs.realpath(target);
  } catch {
    throw new PathError(`Path does not exist: ${relative}`);
  }
  const rel = path.relative(realRoot, realTarget);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new PathError(`Path is outside the allowed root: ${relative}`);
  }
  return realTarget;
}

export interface WalkResult {
  files: string[];
  /** True when the walk stopped early because MAX_FILES was reached. */
  truncated: boolean;
}

export async function walkFiles(dir: string, extensions: readonly string[]): Promise<WalkResult> {
  const files: string[] = [];
  let truncated = false;

  async function visit(current: string): Promise<void> {
    if (truncated) return;
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (truncated) return;
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) await visit(full);
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        if (files.length >= MAX_FILES) {
          truncated = true;
          return;
        }
        files.push(full);
      }
    }
  }

  await visit(dir);
  return { files, truncated };
}

/** Reads a text file, returning null for files that are too large to be worth scanning. */
export async function readTextFile(file: string): Promise<string | null> {
  const stat = await fs.stat(file);
  if (stat.size > MAX_FILE_BYTES) return null;
  return fs.readFile(file, 'utf8');
}

export async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
