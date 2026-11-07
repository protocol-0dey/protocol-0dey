---
name: ui-from-reference
description: Build or restyle a UI so it matches a visual reference (screenshot, mockup, design image) and prove how close it is. Use when the user gives an image or design to reproduce, or says "make it look like this".
---

# UI from a visual reference

The goal is a faithful, working, responsive implementation, not an approximate "inspired by". Measure the result instead of judging it by eye.

## 1. Read the reference before writing code

Write down, from the image only:

- **Layout:** grid or flex structure, column count, max content width, spacing rhythm between sections.
- **Tokens:** colors (background, surface, text, muted, accent, states), type scale and weights, radii, borders, shadows, spacing steps. Put them in CSS variables first; never scatter raw hex values through components.
- **Components:** every distinct piece (nav, card, button variants, form field, badge, table row) and the states you can see (hover, active, focus, disabled, selected).
- **What the image cannot tell you:** hover/focus/empty/loading/error states, behaviour on narrow screens, real content lengths. List these as decisions you must make, and make them consistent with the visible style.

If the reference is at one width only (usually desktop), say so and design the other widths deliberately.

## 2. Build in this order

1. Semantic HTML structure (landmarks, headings in order, real `button`/`a`/`label` elements).
2. Tokens and base styles.
3. Components from the smallest up, with all states.
4. Page layout at the reference width.
5. Responsive behaviour: mobile first, then widen. Nothing should scroll sideways.
6. Real interactions: clicks, forms with validation, dialogs with focus management. A static picture is not done.

## 3. Compare with numbers

Take a screenshot of your build at the same viewport size as the reference, then diff them with the plugin script:

```bash
node scripts/visual-diff.mjs reference.png actual.png --out diff.png
```

Read the result:

- The size line tells you if your page is taller or wider than the reference. That is a layout finding.
- The percentage is a guide, not a target. Anti-aliasing, fonts and photos will always differ. Look at `diff.png` and fix large coloured regions first: wrong spacing, colors, alignment, missing elements.
- Repeat until the remaining differences are explainable (font rendering, image content).

## 4. Report honestly

Finish with a short note: what matches, what deliberately differs and why (for example "added a visible focus ring", "reference text contrast was too low"), and which states or widths you had to invent. Never claim "pixel perfect" without the diff to show it.

## Rules of thumb

- Match the reference's _system_, not each pixel: if spacing is clearly an 8px scale, use the scale.
- Use the reference's fonts if available; otherwise pick the closest and say so.
- Do not copy trademarked logos or artwork from a reference. Use placeholders.
- Keep tap targets at least 44px and inputs at 16px or larger on mobile, even if the reference is smaller.
