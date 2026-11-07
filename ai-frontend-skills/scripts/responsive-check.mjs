#!/usr/bin/env node
/**
 * Responsive audit. Loads a URL at several viewport widths and reports the things that
 * most often break on real devices: horizontal overflow, tiny tap targets, small text,
 * iOS-zooming inputs, a missing viewport meta tag and console errors. Saves a full-page
 * screenshot per width.
 *
 *   node responsive-check.mjs <url> [--out ./responsive-report] [--widths 360,390,768,1024,1440]
 *
 * Exit code 1 when a blocking problem is found (overflow, console errors), so it can run in CI.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from './lib/args.mjs';
import { launchBrowser, openPage } from './lib/browser.mjs';

const { positional, options } = parseArgs(process.argv.slice(2));
const url = positional[0];
if (!url) {
  console.error('Usage: node responsive-check.mjs <url> [--out dir] [--widths 360,390,768,1024,1440]');
  process.exit(2);
}
const outDir = path.resolve(typeof options.out === 'string' ? options.out : 'responsive-report');
const widths = (typeof options.widths === 'string' ? options.widths : '360,390,768,1024,1440')
  .split(',')
  .map(Number)
  .filter((n) => n >= 200 && n <= 4000);

/** Runs inside the page. Must be self-contained. */
function inspect({ mobile }) {
  const vw = window.innerWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ''}`;
  };
  const insideScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && p.getBoundingClientRect().width <= vw + 1) return true;
    }
    return false;
  };

  const overflowPx = document.documentElement.scrollWidth - vw;
  const offenders = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (offenders.length >= 8) break;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !insideScroller(el) && getComputedStyle(el).position !== 'fixed') {
      offenders.push(`${describe(el)} (right edge ${Math.round(r.right)}px)`);
    }
  }

  const smallTargets = [];
  if (mobile) {
    const selector = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], summary';
    for (const el of document.querySelectorAll(selector)) {
      if (smallTargets.length >= 12 || !visible(el)) continue;
      const style = getComputedStyle(el);
      // Links flowing inside a sentence are exempt, as in WCAG 2.2 target size.
      if (el.tagName === 'A' && style.display === 'inline') continue;
      if (el.type === 'checkbox' || el.type === 'radio') {
        const label = el.closest('label');
        if (label && visible(label) && label.getBoundingClientRect().height >= 44) continue;
      }
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) {
        smallTargets.push(`${describe(el)} (${Math.round(r.width)}x${Math.round(r.height)}px)`);
      }
    }
  }

  const smallText = new Set();
  const iosZoomInputs = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    let size = parseFloat(getComputedStyle(el).fontSize);
    // SVG text is scaled with its viewBox, so the rendered size is the CSS size times the screen scale.
    if (el instanceof SVGGraphicsElement && typeof el.getScreenCTM === 'function') {
      const ctm = el.getScreenCTM();
      if (ctm) size = Math.round(size * Math.abs(ctm.a) * 10) / 10;
    }
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (hasOwnText && size < 12 && smallText.size < 6) smallText.add(`${describe(el)} (${size}px)`);
    if (mobile && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && size < 16 && iosZoomInputs.length < 6) {
      if (!['checkbox', 'radio', 'hidden', 'range', 'color'].includes(el.type)) {
        iosZoomInputs.push(`${describe(el)} (${size}px)`);
      }
    }
  }

  return {
    overflowPx,
    offenders,
    smallTargets,
    smallText: [...smallText],
    iosZoomInputs,
    hasViewportMeta: !!document.querySelector('meta[name=viewport]'),
  };
}

await mkdir(outDir, { recursive: true });
const browser = await launchBrowser();
const report = { url, generatedAt: new Date().toISOString(), widths: [] };
let blocking = 0;

for (const width of widths) {
  const mobile = width <= 768;
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    hasTouch: mobile,
    isMobile: mobile,
  });
  const { page, problems } = await openPage(context, url);
  const result = await page.evaluate(inspect, { mobile });
  const shot = path.join(outDir, `width-${width}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  await context.close();

  const entry = { width, screenshot: shot, ...result, ...problems };
  report.widths.push(entry);
  if (result.overflowPx > 1 || problems.consoleErrors.length > 0) blocking++;
}
await browser.close();

await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const lines = [`Responsive audit: ${url}`, ''];
for (const w of report.widths) {
  const issues = [];
  if (w.overflowPx > 1) issues.push(`horizontal overflow ${w.overflowPx}px${w.offenders.length ? ` (${w.offenders.join('; ')})` : ''}`);
  if (w.smallTargets.length) issues.push(`${w.smallTargets.length} tap target(s) under 44px: ${w.smallTargets.slice(0, 4).join('; ')}`);
  if (w.iosZoomInputs.length) issues.push(`inputs under 16px zoom on iOS: ${w.iosZoomInputs.join('; ')}`);
  if (w.smallText.length) issues.push(`text under 12px: ${w.smallText.join('; ')}`);
  if (!w.hasViewportMeta) issues.push('missing <meta name="viewport">');
  if (w.consoleErrors.length) issues.push(`console errors: ${w.consoleErrors.slice(0, 3).join(' | ')}`);
  lines.push(`${String(w.width).padStart(4)}px  ${issues.length ? 'ISSUES' : 'ok'}`);
  for (const issue of issues) lines.push(`        - ${issue}`);
}
lines.push('', `Screenshots and report.json saved in ${outDir}`);
console.log(lines.join('\n'));
process.exit(blocking > 0 ? 1 : 0);
