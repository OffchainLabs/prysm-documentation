#!/usr/bin/env bash
# Regenerates src/data/cli-*.json from the Prysm source tree.
#
# Usage: tools/gen-cli-reference.sh [path-to-prysm-repo]
#
# A Go build overlay injects a tiny init() into each binary that serialises
# the flag groups and subcommands to JSON, so the Prysm checkout is never
# modified.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PRYSM="$(cd "${1:-$ROOT/../prysm}" && pwd)"
TOOLS="$ROOT/tools/flagdump"
OUT="$ROOT/src/data"
WORK="$(mktemp -d)"
trap 'rm -r "$WORK"' EXIT

cat > "$WORK/overlay.json" <<JSON
{
  "Replace": {
    "$PRYSM/cmd/beacon-chain/zz_docs_common.go": "$TOOLS/common.go.txt",
    "$PRYSM/cmd/beacon-chain/zz_docs_main.go": "$TOOLS/beacon.go.txt",
    "$PRYSM/cmd/validator/zz_docs_common.go": "$TOOLS/common.go.txt",
    "$PRYSM/cmd/validator/zz_docs_main.go": "$TOOLS/validator.go.txt",
    "$PRYSM/cmd/prysmctl/zz_docs_common.go": "$TOOLS/common.go.txt",
    "$PRYSM/cmd/prysmctl/zz_docs_main.go": "$TOOLS/prysmctl.go.txt"
  }
}
JSON

VERSION="${PRYSM_VERSION:-$(git -C "$PRYSM" describe --tags --abbrev=0 2>/dev/null || echo unknown)}"
mkdir -p "$OUT"
for bin in beacon-chain validator prysmctl; do
  echo "» $bin"
  (cd "$PRYSM" && go build -overlay "$WORK/overlay.json" -o "$WORK/$bin" "./cmd/$bin")
  # The unknown flag guarantees the binary exits instead of starting a node
  # should the dump hook ever fail to fire.
  PRYSM_DOCS_DUMP=1 "$WORK/$bin" --docs-dump-guard > "$WORK/$bin.json"
  # Replace the machine-specific home directory in default paths.
  sed "s#$HOME#~#g" "$WORK/$bin.json" > "$OUT/cli-$bin.json"
done
printf '{ "version": "%s" }\n' "$VERSION" > "$OUT/cli-meta.json"
echo "Wrote CLI reference for Prysm $VERSION to $OUT"
