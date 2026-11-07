---
name: verify-ai-code
description: A checklist for verifying code written by an AI assistant before accepting it, including dependency existence, lint, types, tests, build, browser behaviour and security review. Use before merging or presenting AI-generated frontend code, or when asked how AI output should be checked.
---

# Verifying AI-written code

AI output is a draft from a fast, confident colleague who has never run the code. Accept nothing until it has passed the steps below. Report what you actually ran, never what you assume.

## 1. Read the diff

- Read every changed line. If you cannot explain a line, do not keep it.
- Look for invented APIs (methods, props, config keys that do not exist), leftover placeholders, `TODO`s, commented-out code, unrelated edits, and hard-coded secrets or URLs.
- Check scope: did it change more than was asked?

## 2. Check dependencies are real

Assistants sometimes invent package names, and an attacker can register an invented name.

```bash
node scripts/check-deps-exist.mjs package.json
```

For any new or unfamiliar package, also look at the repository, maintainers, download count and last release. Prefer fewer dependencies: is the package needed at all?

## 3. Run the automated gates

Run what the project already has, in this order, and read the output:

```bash
npm run lint
npm run typecheck      # or: npx tsc --noEmit
npm test
npm run build
```

A green run proves only what is tested. If a change has no test, add one for the behaviour that matters, and for the failure case. Make a test fail first (or break the code on purpose) to prove it can fail.

## 4. Run it in a browser

Tests do not see layout, focus or real timing. Open the feature and use it:

- The happy path, then the unhappy paths: empty input, invalid input, slow network, request failure, double click, back button, refresh.
- Loading, empty and error states exist and look right.
- Phone width and desktop width (`responsive-audit` skill), light and dark theme.
- Keyboard only, and a quick `a11y-quick-audit`.
- Browser console: no errors or warnings.

## 5. Security and robustness review

- Untrusted data is never rendered as HTML (`dangerouslySetInnerHTML`, `innerHTML`) without sanitising; no `eval`, no string-built URLs or queries.
- No secrets in source, logs or client bundles; configuration comes from environment variables.
- Errors are handled and shown to the user, not swallowed; async work is cancelled or ignored when the component goes away.
- Network calls have timeouts and handle non-2xx responses.

## 6. Commit small, explain the change

One logical change per commit with a clear message. In the pull request, state what was verified and how, and what was _not_ verified. If AI wrote part of it, that is fine; owning the result is the point.

## Report format

- **Ran:** the exact commands and their result.
- **Checked by hand:** what you used in the browser.
- **Found and fixed:** problems the checks caught.
- **Not verified:** anything skipped, and why.
