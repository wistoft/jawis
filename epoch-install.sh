#!/bin/bash
set -euo pipefail

EPOCH=$1

# Need dependencies to run `build-prepare-epoch.ts`
yarn install --frozen-lockfile --non-interactive

yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts "$EPOCH" --skip-clean-repo-check

yarn install --frozen-lockfile --non-interactive

echo "Epoch $EPOCH" installed