import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { PNG } from 'pngjs';
import { parseArgs } from './lib/args.mjs';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

function solid(width, height, [r, g, b]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = r;
    png.data[i * 4 + 1] = g;
    png.data[i * 4 + 2] = b;
    png.data[i * 4 + 3] = 255;
  }
  return png;
}

async function diff(a, b) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'vdiff-'));
  await writeFile(path.join(dir, 'a.png'), PNG.sync.write(a));
  await writeFile(path.join(dir, 'b.png'), PNG.sync.write(b));
  try {
    const { stdout } = await run('node', [path.join(here, 'visual-diff.mjs'), path.join(dir, 'a.png'), path.join(dir, 'b.png'), '--out', path.join(dir, 'd.png')]);
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code, stdout: error.stdout };
  }
}

test('parseArgs separates positionals, options and flags', () => {
  const { positional, options } = parseArgs(['http://x', '--out', 'dir', '--json', '--widths', '360,390']);
  assert.deepEqual(positional, ['http://x']);
  assert.deepEqual(options, { out: 'dir', json: true, widths: '360,390' });
});

test('visual-diff reports 0% for identical images', async () => {
  const { code, stdout } = await diff(solid(20, 20, [10, 20, 30]), solid(20, 20, [10, 20, 30]));
  assert.equal(code, 0);
  assert.match(stdout, /\(0\.00%\)/);
});

test('visual-diff fails when images differ a lot', async () => {
  const { code, stdout } = await diff(solid(20, 20, [0, 0, 0]), solid(20, 20, [255, 255, 255]));
  assert.equal(code, 1);
  assert.match(stdout, /\(100\.00%\)/);
});

test('visual-diff reports a size mismatch', async () => {
  const { stdout } = await diff(solid(20, 20, [5, 5, 5]), solid(30, 25, [5, 5, 5]));
  assert.match(stdout, /Size mismatch: width \+10px, height \+5px/);
});
