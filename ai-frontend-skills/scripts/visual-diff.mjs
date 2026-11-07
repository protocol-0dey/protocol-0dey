#!/usr/bin/env node
/**
 * Compares a reference image with a screenshot of your build and writes a diff image.
 * Used to check "does my implementation match the reference?" with numbers instead of eyeballing.
 *
 *   node visual-diff.mjs <reference.png> <actual.png> [--out diff.png] [--threshold 0.1]
 *
 * If sizes differ, both images are compared on the overlapping top-left area and the size
 * difference is reported, because a layout that is taller or wider is a finding in itself.
 * Exit code 1 when more than 5% of the compared pixels differ.
 */
import { readFile, writeFile } from 'node:fs/promises';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { parseArgs } from './lib/args.mjs';

const { positional, options } = parseArgs(process.argv.slice(2));
const [refPath, actualPath] = positional;
if (!refPath || !actualPath) {
  console.error('Usage: node visual-diff.mjs <reference.png> <actual.png> [--out diff.png] [--threshold 0.1]');
  process.exit(2);
}
const threshold = Number(options.threshold) || 0.1;
const outPath = typeof options.out === 'string' ? options.out : 'diff.png';

const ref = PNG.sync.read(await readFile(refPath));
const actual = PNG.sync.read(await readFile(actualPath));
const width = Math.min(ref.width, actual.width);
const height = Math.min(ref.height, actual.height);

function crop(png) {
  if (png.width === width && png.height === height) return png.data;
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    png.data.copy(out, y * width * 4, y * png.width * 4, y * png.width * 4 + width * 4);
  }
  return out;
}

const diff = new PNG({ width, height });
const differing = pixelmatch(crop(ref), crop(actual), diff.data, width, height, { threshold });
await writeFile(outPath, PNG.sync.write(diff));

const total = width * height;
const percent = (differing / total) * 100;
const lines = [
  `Reference: ${ref.width}x${ref.height}   Actual: ${actual.width}x${actual.height}`,
  `Compared area: ${width}x${height}`,
  `Different pixels: ${differing} of ${total} (${percent.toFixed(2)}%)`,
  `Diff image: ${outPath}`,
];
if (ref.width !== actual.width || ref.height !== actual.height) {
  lines.push(
    `Size mismatch: width ${actual.width - ref.width >= 0 ? '+' : ''}${actual.width - ref.width}px, height ${actual.height - ref.height >= 0 ? '+' : ''}${actual.height - ref.height}px versus the reference.`,
  );
}
console.log(lines.join('\n'));
process.exit(percent > 5 ? 1 : 0);
