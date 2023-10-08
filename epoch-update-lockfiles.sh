#!/bin/bash
set -euo pipefail

for ((i=0; i<2; i++)) do 
   
  yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts "$i"

  yarn install

  echo "Epoch $i" installed

  # reset epoch

  yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts 99 --skip-clean-repo-check

  # commit new lock file

  epochLockFile=yarn.epoch.$i.lock

  if ! cmp -s yarn.lock $epochLockFile; then
  
    cp yarn.lock $epochLockFile

    git add $epochLockFile && git commit -m "Epoch $i updated  --  automated"
    
  fi

  # reset yarn.lock

  git checkout yarn.lock

done