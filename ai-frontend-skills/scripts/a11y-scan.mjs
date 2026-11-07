#!/usr/bin/env node
/**
 * Accessibility quick audit: axe-core rules (WCAG 2.x A/AA + best practices) plus a keyboard
 * pass that tabs through the page and reports elements that take focus without a visible indicator.
 *
 *   node a11y-scan.mjs <url> [--width 1280] [--tabs 40] [--scheme light|dark] [--json report.json]
 *
 * Automated checks find roughly a third of real accessibility problems. Treat a clean result as
 * "no detectable issues", not as "accessible": screen reader and keyboard testing by hand still matter.
 * Exit code 1 when serious or critical violations exist.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { parseArgs } from './lib/args.mjs';
import { launchBrowser, openPage } from './lib/browser.mjs';

const { positional, options } = parseArgs(process.argv.slice(2));
const url = positional[0];
if (!url) {
  console.error('Usage: node a11y-scan.mjs <url> [--width 1280] [--tabs 40] [--scheme light|dark] [--json report.json]');
  process.exit(2);
}
const width = Number(options.width) || 1280;
const maxTabs = Number(options.tabs) || 40;
const scheme = options.scheme === 'dark' ? 'dark' : 'light';

const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
const { page } = await openPage(context, url);

await page.evaluate(axeSource);
const axeResult = await page.evaluate(async () => {
  const result = await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  });
  return result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    count: v.nodes.length,
    nodes: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 140), why: n.failureSummary })),
  }));
});

// Keyboard pass: press Tab repeatedly and look at what receives focus.
const keyboard = { focusStops: [], noVisibleFocus: [], trappedAt: null };
const seen = new Set();
for (let i = 0; i < maxTabs; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
    const shadow = s.boxShadow !== 'none';
    const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return {
      name: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${label}"`,
      visibleBox: r.width > 0 && r.height > 0,
      indicator: outline || shadow,
    };
  });
  if (!info) continue;
  if (seen.has(info.name)) break; // wrapped around: the whole page was covered
  seen.add(info.name);
  keyboard.focusStops.push(info.name);
  if (!info.indicator) keyboard.noVisibleFocus.push(info.name);
}
await browser.close();

const rank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
axeResult.sort((a, b) => (rank[a.impact] ?? 4) - (rank[b.impact] ?? 4));
const blocking = axeResult.filter((v) => v.impact === 'critical' || v.impact === 'serious');

const report = { url, width, scheme, axeViolations: axeResult, keyboard };
if (typeof options.json === 'string') await writeFile(options.json, JSON.stringify(report, null, 2));

const lines = [`Accessibility audit: ${url} (${width}px, ${scheme} scheme)`, ''];
if (axeResult.length === 0) lines.push('axe-core: no violations detected.');
for (const v of axeResult) {
  lines.push(`[${v.impact}] ${v.id}: ${v.help} (${v.count} element${v.count === 1 ? '' : 's'})`);
  for (const n of v.nodes) lines.push(`    ${n.target}\n      ${n.html}`);
  lines.push(`    ${v.helpUrl}`);
}
lines.push('', `Keyboard: ${keyboard.focusStops.length} focus stop(s) reached with Tab.`);
if (keyboard.focusStops.length === 0) lines.push('  - Nothing could be focused with the keyboard.');
if (keyboard.noVisibleFocus.length) {
  lines.push(`  - Possibly no visible focus indicator on: ${keyboard.noVisibleFocus.slice(0, 8).join('; ')}`);
  lines.push('    (heuristic: checks outline and box-shadow only; confirm by tabbing through the page)');
}
console.log(lines.join('\n'));
process.exit(blocking.length > 0 ? 1 : 0);
