#!/usr/bin/env bash
set -euo pipefail

# ── Vite build ──────────────────────────────────────────────
cd "$(dirname "$0")"
npm run build

# ── Deploy ──────────────────────────────────────────────────
# nginx serves the SPA from staticfiles/vue (repo) at /
# Keep the Frappe app's public copy in sync too (fallback + /assets origin)
BENCH_APP_PUBLIC="/home/frappe/bench/apps/sejel_app/sejel_app/public"
VITE_HTML="../staticfiles/vue/index.html"

if [[ ! -f "$VITE_HTML" ]]; then
  echo "ERROR: $VITE_HTML not found after build" >&2
  exit 1
fi

# Extract the JS and CSS asset paths from the Vite output
JS_FILE=$(grep -oP 'src="/assets/[^"]+\.js"' "$VITE_HTML" | head -1 | sed 's|src="/assets/||;s|"||')
CSS_FILE=$(grep -oP 'href="/assets/[^"]+\.css"' "$VITE_HTML" | head -1 | sed 's|href="/assets/||;s|"||')

if [[ -z "$JS_FILE" || -z "$CSS_FILE" ]]; then
  echo "ERROR: Could not extract asset names from $VITE_HTML" >&2
  exit 1
fi

echo "  JS  → $BENCH_APP_PUBLIC/assets/$JS_FILE"
echo "  CSS → $BENCH_APP_PUBLIC/assets/$CSS_FILE"

mkdir -p "$BENCH_APP_PUBLIC/assets"
cp ../staticfiles/vue/assets/* "$BENCH_APP_PUBLIC/assets/"
cp "$VITE_HTML" "$BENCH_APP_PUBLIC/index.html"

echo "✓ Deployed SPA to $BENCH_APP_PUBLIC (nginx serves /assets from here)"
