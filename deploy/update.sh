#!/usr/bin/env bash
# Pull the latest code and reload the app with zero manual steps.
# Usage (on the server, from the app folder):  ./deploy/update.sh [branch]
set -euo pipefail

BRANCH="${1:-development}"
cd "$(dirname "$0")/.."

echo "==> Fetching $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Installing dependencies"
npm ci --omit=dev

echo "==> Reloading pm2 app"
if pm2 describe worklog >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

echo "==> Health check"
sleep 2
curl -fsS http://127.0.0.1:3000/api/health && echo " OK"
