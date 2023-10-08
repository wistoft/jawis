#!/bin/bash
set -euo pipefail

EPOCH=$1

yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts "$EPOCH"

yarn install

echo "Epoch $EPOCH" installed