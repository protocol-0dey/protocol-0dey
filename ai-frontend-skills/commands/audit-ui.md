---
description: Run the responsive and accessibility audits on a URL and summarise the findings
argument-hint: <url>
---

Audit the UI at $ARGUMENTS.

1. Use the `responsive-audit` skill to run the responsive check at the default widths and look at the 390px and 768px screenshots.
2. Use the `a11y-quick-audit` skill to scan the page in the light and dark schemes.
3. Reply with one prioritised list: blocking problems first, then warnings, then manual checks that remain. For each item give the element, the problem and the fix. If the code is in this repository, fix the blocking items and re-run both audits to show a clean result.
