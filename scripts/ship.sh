#!/usr/bin/env bash
# Ship changes: validate, commit, push to main → Railway auto-deploys from GitHub.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ $# -lt 1 ]]; then
  echo "Usage: ./scripts/ship.sh \"commit message\""
  exit 1
fi

MSG="$1"

echo "→ lint"
npm run lint

echo "→ build"
npm run build

echo "→ git status"
git status -sb

if git diff --quiet && git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

git add -A
git commit -m "$MSG"
git push origin main

echo "→ Pushed to main. Railway will redeploy if GitHub auto-deploy is enabled."
