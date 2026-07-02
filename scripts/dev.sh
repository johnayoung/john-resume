#!/usr/bin/env bash
# Local dev: regenerate OG cards then run `hugo serve`.
# CI does the equivalent in .github/workflows/hugo.yml.
# Pass extra hugo flags after the script name, e.g. `scripts/dev.sh --port 1314`.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Generating OG cards"
(cd scripts/og-gen && go run . -content ../../content/blog -out ../../static/og)

echo "==> Starting Hugo"
exec hugo serve "$@"
