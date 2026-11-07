---
name: responsive-audit
description: Audit a web page across phone, tablet and desktop widths for horizontal overflow, tiny tap targets, small text and console errors, with screenshots. Use when asked to check, test or fix responsiveness or mobile layout.
---

# Responsive audit

Run a real browser at several widths and report what breaks. Do not judge responsiveness from the CSS alone.

## Run it

The page must be reachable by URL (a dev server, `vite preview`, or a deployed site).

```bash
node scripts/responsive-check.mjs http://localhost:5173 --out ./responsive-report
```

Options: `--widths 360,390,768,1024,1440` (defaults shown). The script lives in this plugin's `scripts/` folder (`${CLAUDE_PLUGIN_ROOT}/scripts` when that variable is available). First use: run `npm install` in the plugin folder, and set `CHROME_PATH` to a Chrome/Chromium binary or run `npx playwright-core install chromium`.

It writes `width-<n>.png` (full-page screenshots) and `report.json`, prints a summary, and exits with code 1 on horizontal overflow or console errors.

## What it checks

| Finding                                               | Why it matters                                 | Typical fix                                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Horizontal overflow (with the elements that cause it) | Sideways scrolling on phones                   | Fix the offending element (`min-width: 0`, `max-width: 100%`, wrap text); do not hide it with `overflow-x: hidden` on the body |
| Tap targets under 44px (mobile widths)                | Hard to hit with a thumb                       | `min-height: 44px` on buttons, links in nav, toggles                                                                           |
| Inputs under 16px (mobile)                            | iOS Safari zooms the page on focus             | `font-size: 16px` on inputs, selects, textareas                                                                                |
| Text under 12px (rendered size)                       | Unreadable; SVG text is measured after scaling | Larger size, or draw SVG charts in real pixels instead of scaling a viewBox                                                    |
| Missing `<meta name="viewport">`                      | Phones render a desktop layout                 | Add `width=device-width, initial-scale=1`                                                                                      |
| Console errors                                        | Often broken features on some widths           | Fix the error                                                                                                                  |

## Then look at the screenshots

The script cannot see ugly-but-valid layouts. Open at least the 390px and one tablet screenshot and check: content order, truncated or overlapping text, images stretched, empty gaps, sticky elements covering content, navigation reachable, forms usable with the keyboard open.

## Report

Summarise per width: what is fine, what you changed, and what remains. After fixing, run the script again and show the clean result. If a finding is intentional (for example a horizontally scrolling table in its own container), say so explicitly.
