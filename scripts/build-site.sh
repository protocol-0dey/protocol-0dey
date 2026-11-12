#!/usr/bin/env bash
# Assembles the GitHub Pages site into ./_site:
#   /            portfolio showcase
#   /screens/    screenshots
#   /references/ and /landings/  static concept sites
#   /taskflow/ /pulse/ /launchpad/  built React apps
# Usage: BASE=/protocol-0dey/ scripts/build-site.sh
set -euo pipefail
BASE="${BASE:-/protocol-0dey/}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/_site"
rm -rf "$OUT" && mkdir -p "$OUT"

cp "$ROOT/portfolio/index.html" "$OUT/index.html"
cp "$ROOT/portfolio/404.html" "$OUT/404.html"
cp -r "$ROOT/docs/screens" "$OUT/screens"
cp -r "$ROOT/references" "$OUT/references"
cp -r "$ROOT/landings" "$OUT/landings"
rm -f "$OUT/references/README.md" "$OUT/landings/README.md"

for app in taskflow pulse launchpad; do
  (cd "$ROOT/$app" && npm ci --no-audit --no-fund && npx vite build --base="${BASE}${app}/" --outDir "$OUT/$app" --emptyOutDir)
done
touch "$OUT/.nojekyll"
echo "Site assembled in $OUT"
