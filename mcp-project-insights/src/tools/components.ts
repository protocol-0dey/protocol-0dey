import path from 'node:path';
import { readTextFile, walkFiles } from '../fs-safe.js';

export interface ComponentFile {
  file: string;
  lines: number;
  components: string[];
  useState: number;
  useEffect: number;
  flags: string[];
}

export interface ComponentReport {
  totalFiles: number;
  totalComponents: number;
  /** Files sorted by size, largest first, limited to `limit`. */
  files: ComponentFile[];
  flagged: number;
  truncated: boolean;
}

const EXPORTED_COMPONENT =
  /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/g;
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length;

export interface ComponentOptions {
  minLines?: number;
  limit?: number;
}

/** Heuristic (regex based) inventory of React components. Good for triage, not a replacement for a parser. */
export async function componentInventory(
  dir: string,
  options: ComponentOptions = {},
): Promise<ComponentReport> {
  const minLines = options.minLines ?? 200;
  const limit = options.limit ?? 20;
  const { files, truncated } = await walkFiles(dir, ['.tsx', '.jsx']);
  const result: ComponentFile[] = [];

  for (const file of files) {
    if (/\.(test|spec|stories)\.[jt]sx?$/.test(file)) continue;
    const text = await readTextFile(file);
    if (text === null) continue;
    const components = [...text.matchAll(EXPORTED_COMPONENT)].map((m) => m[1] as string);
    if (components.length === 0) continue;

    const lines = text.split(/\r?\n/).length;
    const useState = count(text, /\buseState\s*[<(]/g);
    const useEffect = count(text, /\buseEffect\s*\(/g);
    const flags: string[] = [];
    if (lines > minLines) flags.push(`large file (${lines} lines, limit ${minLines})`);
    if (components.length > 3) flags.push(`${components.length} components in one file`);
    if (useState > 5)
      flags.push(`${useState} useState calls: consider a reducer or splitting the component`);
    if (useEffect > 3)
      flags.push(`${useEffect} useEffect calls: check for derived state or missing cleanup`);

    result.push({
      file: path.relative(dir, file).split(path.sep).join('/'),
      lines,
      components,
      useState,
      useEffect,
      flags,
    });
  }

  result.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
  return {
    totalFiles: result.length,
    totalComponents: result.reduce((sum, f) => sum + f.components.length, 0),
    files: result.slice(0, limit),
    flagged: result.filter((f) => f.flags.length > 0).length,
    truncated,
  };
}
