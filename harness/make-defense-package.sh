#!/usr/bin/env bash
# Build the defense/submission package from the repo.
# Usage: bash harness/make-defense-package.sh [dest]   (default: ~/Desktop/doanai-bao-ve)
#
# The package holds ONLY submission/defense artifacts (DOCX, PPTX, figures,
# data, offline demo evidence, source snapshot). Working documents — the
# run-of-show guide, talk tracks, chapter drafts, Q&A notes — live in the repo
# (docs/bao-cao/huong-dan-bao-ve.md is the run-of-show and points back here).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$HOME/Desktop/doanai-bao-ve}"

# Selective cleanup: regenerate only what this script owns, preserving
# user-added content (recorded demo video, an unpacked+installed doanai-src,
# a filled-in .env). Legacy layout leftovers are removed too.
rm -rf "$DEST/01-bao-cao" "$DEST/02-slide" "$DEST/03-so-lieu-hinh" "$DEST/04-phan-bien"
rm -f "$DEST/HUONG-DAN.md" "$DEST/HUONG-DAN.html" \
      "$DEST"/0[45]-demo-offline/vlm-suite-report.html \
      "$DEST"/0[45]-demo-offline/vlm-test-A3-report.html \
      "$DEST"/0[45]-demo-offline/README.md \
      "$DEST"/0[56]-ma-nguon/doanai-src.zip \
      "$DEST"/0[56]-ma-nguon/README.md
# Migrate user files from legacy dir names, then drop empty legacy dirs.
for pair in "05-demo-offline:04-demo-offline" "06-ma-nguon:05-ma-nguon"; do
  old="${pair%%:*}"; new="${pair##*:}"
  if [ -d "$DEST/$old" ]; then
    mkdir -p "$DEST/$new"
    find "$DEST/$old" -mindepth 1 -maxdepth 1 -exec mv {} "$DEST/$new/" \; 2>/dev/null || true
    rmdir "$DEST/$old" 2>/dev/null || true
  fi
done
mkdir -p "$DEST"/{01-bao-cao,02-slide,03-so-lieu-hinh,04-demo-offline,05-ma-nguon}

# 01 — report documents (the actual submission)
cp "$ROOT/docs/bao-cao/bao-cao-doan.docx" "$DEST/01-bao-cao/"
cp "$ROOT/docs/DeCuong_VLM_GUI_Testing_TongQuat.docx" "$DEST/01-bao-cao/"

# 02 — slide deck
cp "$ROOT/docs/bao-cao/slide-bao-ve.pptx" "$DEST/02-slide/"

# 03 — figures and official numbers (evidence for the committee)
cp -R "$ROOT/results/figures" "$DEST/03-so-lieu-hinh/figures"
cp -R "$ROOT/results/screenshots-app-v1" "$DEST/03-so-lieu-hinh/screenshots-app-v1"
cp -R "$ROOT/masking/screens" "$DEST/03-so-lieu-hinh/masking-screens"
cp "$ROOT/results/raw/matrix-runs.csv" "$DEST/03-so-lieu-hinh/"
cp "$ROOT/masking/generated/grounding-results.csv" "$DEST/03-so-lieu-hinh/"

# 04 — offline demo evidence: merged 27/27 suite report + one single test
MERGED=$(ls -t "$ROOT"/tests-vlm/midscene_run/report/playwright-merged-*.html | head -1)
SINGLE=$(ls -S "$ROOT"/tests-vlm/midscene_run/report/playwright-A3--*.html | head -1)
cp "$MERGED" "$DEST/04-demo-offline/vlm-suite-report.html"
cp "$SINGLE" "$DEST/04-demo-offline/vlm-test-A3-report.html"

# 05 — source snapshot (no node_modules; offline install fallback)
git -C "$ROOT" archive --format=zip -o "$DEST/05-ma-nguon/doanai-src.zip" HEAD

# Root guide for outsiders: folder meanings + full setup/demo walkthrough.
cp "$ROOT/docs/bao-cao/goi-bao-ve-huong-dan.html" "$DEST/HUONG-DAN.html"

echo "Defense package built at: $DEST"
du -sh "$DEST"
du -sh "$DEST"/*/ | sed 's|'"$DEST"'/||'
