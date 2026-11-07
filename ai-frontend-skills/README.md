# ai-frontend-skills

A [Claude Code](https://code.claude.com) plugin with four skills, one slash command and four small scripts for the parts of frontend work where an AI assistant most needs a process: matching a design, checking a page on real devices, checking accessibility, and verifying AI-written code before trusting it.

The scripts are plain Node (Playwright + axe-core + pixelmatch), so they work without Claude too.

## Skills

| Skill               | Use it when                                  | What it adds                                                                                           |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `ui-from-reference` | You have a screenshot or mockup to reproduce | A method (tokens, components, states), then a measured pixel diff instead of "looks close"             |
| `responsive-audit`  | A page must work on phones and desktops      | Runs a real browser at 5 widths: overflow, tap targets, small text, iOS input zoom, console errors     |
| `a11y-quick-audit`  | You need an accessibility check              | axe-core WCAG rules in light and dark themes, plus a keyboard Tab pass; lists what still needs a human |
| `verify-ai-code`    | AI wrote code you are about to merge         | A checklist: read the diff, check packages exist, lint/types/tests/build, browser run, security review |

Command: `/audit-ui <url>` runs the responsive and accessibility audits and returns one prioritised list.

## Scripts

```bash
npm install                                   # once, in this folder
export CHROME_PATH=/usr/bin/google-chrome     # or: npx playwright-core install chromium

node scripts/responsive-check.mjs http://localhost:5173 --out ./report
node scripts/a11y-scan.mjs http://localhost:5173 --scheme dark
node scripts/visual-diff.mjs reference.png actual.png --out diff.png
node scripts/check-deps-exist.mjs package.json
```

All four exit with code `1` when they find a blocking problem, so they can run in CI.

| Script             | Checks                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `responsive-check` | Horizontal overflow (and the elements causing it), tap targets under 44px, rendered text under 12px, inputs under 16px, viewport meta, console errors; full-page screenshot per width |
| `a11y-scan`        | axe-core WCAG 2.x A/AA and best-practice rules; keyboard focus order and visible focus indicator (heuristic)                                                                          |
| `visual-diff`      | Pixel difference between a reference image and a screenshot, a diff image, and a size mismatch report                                                                                 |
| `check-deps-exist` | Every dependency in `package.json` exists on the npm registry (catches invented package names)                                                                                        |

## Install in Claude Code

```text
/plugin marketplace add protocol-0dey/protocol-0dey
/plugin install ai-frontend-skills@aleks-frontend-plugins
```

Or load it from a local checkout: `claude --plugin-dir ./ai-frontend-skills`.

## Tested on real projects

The scripts were run against two apps in this repository, [Pulse](../pulse) and [Launchpad](../launchpad). They found real defects, which were then fixed and re-checked:

- **Pulse:** range buttons were 38px high (below the 44px tap target), and chart axis labels rendered at about 4.4px on phones because the SVG was scaled down. The chart now draws in real pixels, with 12px labels.
- **Pulse and Launchpad, light theme:** accent and status colors failed WCAG contrast (3.5-3.7:1). Colors were darkened to 5:1 or better, and a tinted badge background was adjusted.
- **Launchpad:** the logo link, the monthly/yearly toggle and the tablet navigation links were below 44px, and a call-to-action section had no landmark.

After the fixes both apps pass the responsive audit at 360, 390, 768, 1024 and 1440px, and the accessibility scan reports no violations in the light and dark themes (checked at 1280px).

Script behaviour is covered by `npm test` (argument parsing and the visual diff, including a size mismatch). The skills are Markdown instructions; they were validated for structure (frontmatter, names), and the scripts they call were run end to end. I have not run the plugin inside a live Claude Code session in this repository's CI.

## Limits

- Automated accessibility checks find only part of the problems; the skill says what to verify by hand.
- The "no visible focus" check is a heuristic based on `outline` and `box-shadow`.
- `check-deps-exist` proves a package exists, not that it is trustworthy, and needs network access.

## License

MIT
