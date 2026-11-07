---
name: a11y-quick-audit
description: Run an automated accessibility audit (axe-core WCAG rules plus a keyboard Tab pass) on a page in light and dark themes and fix the findings. Use when asked to check accessibility, a11y, contrast, keyboard navigation or screen reader support.
---

# Accessibility quick audit

Automated tools find roughly a third of real accessibility problems. This skill covers that third quickly and reliably, then lists what still needs a human.

## Run it

```bash
node scripts/a11y-scan.mjs http://localhost:5173 --scheme light
node scripts/a11y-scan.mjs http://localhost:5173 --scheme dark
```

Options: `--width 1280`, `--tabs 40`, `--json report.json`. The scripts live in this plugin's `scripts/` folder (`${CLAUDE_PLUGIN_ROOT}/scripts` when available). First use: `npm install` in the plugin folder, and set `CHROME_PATH` or run `npx playwright-core install chromium`.

Run **both schemes**: many contrast bugs exist in only one theme. The script exits with code 1 on serious or critical violations.

## Fix in this order

1. **Critical/serious axe violations**, most elements first. Common ones and the real fix:
   - `color-contrast`: darken text or the tinted background until it reaches 4.5:1 (3:1 for large text). Check translucent backgrounds (`color-mix`, `rgba`): they lower contrast. Compute the ratio rather than guessing.
   - `label` / `button-name` / `link-name`: give controls an accessible name (visible `<label for>`, or `aria-label` for icon-only buttons).
   - `image-alt`: meaningful alt text, or `alt=""` for decorative images.
   - `aria-*` errors: remove ARIA that duplicates native semantics; prefer the real element.
2. **Landmarks and structure** (`region`, `landmark-*`, `heading-order`): one `main`, named `nav`/`section`, headings that do not skip levels.
3. **Keyboard results:** every interactive element must be reachable with Tab and show a visible focus indicator. Fix with `:focus-visible { outline: 2px solid ...; outline-offset: 2px }`. The "no visible focus" line is a heuristic, so confirm by tabbing through the page.

## What the script cannot check (do it by hand)

- Focus is trapped in dialogs, `Escape` closes them, focus returns to the trigger.
- Focus moves sensibly after route changes, step changes and form errors; errors are announced (`role="alert"` or `aria-live`) and linked (`aria-describedby`, `aria-invalid`).
- The page makes sense with a screen reader (VoiceOver, NVDA) and at 200% zoom.
- Motion respects `prefers-reduced-motion`.

## Report

List each violation fixed (rule, element, change), the final clean scan output for both schemes, and the manual checks you did or still recommend. Do not call a page "accessible" because the scan is clean; say "no automatically detectable issues".
