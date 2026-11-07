#!/usr/bin/env node
/**
 * Checks that every dependency in package.json really exists on the npm registry.
 * AI assistants sometimes invent plausible package names ("slopsquatting"), and installing a
 * name an attacker has registered is a supply-chain risk. Run this on AI-written changes.
 *
 *   node check-deps-exist.mjs [path/to/package.json]
 *
 * Needs network access to the npm registry. Exit code 1 if a package does not exist.
 */
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const run = promisify(execFile);
const file = process.argv[2] ?? 'package.json';
const pkg = JSON.parse(await readFile(file, 'utf8'));
const names = [
  ...new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ]),
];

async function check(name) {
  try {
    const { stdout } = await run('npm', ['view', name, 'version', 'time.modified', '--json'], { timeout: 30000 });
    const data = JSON.parse(stdout);
    return { name, status: 'found', version: data.version, modified: data['time.modified'] };
  } catch (error) {
    const text = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    if (/E404|404 Not Found|is not in this registry/i.test(text)) return { name, status: 'missing' };
    return { name, status: 'unknown', reason: text.split('\n')[0]?.slice(0, 120) || String(error.message).slice(0, 120) };
  }
}

// Small worker pool so a large package.json does not open hundreds of connections.
const results = [];
let index = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (index < names.length) results.push(await check(names[index++]));
  }),
);
results.sort((a, b) => a.name.localeCompare(b.name));

const missing = results.filter((r) => r.status === 'missing');
const unknown = results.filter((r) => r.status === 'unknown');
console.log(`Checked ${results.length} package(s) from ${file}`);
for (const r of missing) console.log(`  MISSING  ${r.name}: not on the npm registry. Likely invented, do not install.`);
for (const r of unknown) console.log(`  UNKNOWN  ${r.name}: could not check (${r.reason})`);
if (missing.length === 0 && unknown.length === 0) console.log('  All packages exist on the registry.');
console.log('Note: existing is not the same as trustworthy. Check downloads, maintainers and repository for unfamiliar names.');
process.exit(missing.length > 0 ? 1 : 0);
