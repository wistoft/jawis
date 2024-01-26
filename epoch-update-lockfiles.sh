#!/bin/bash
set -euo pipefail

# epochs

for ((i=0; i<3; i++)) do 
   
  yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts "$i"

  yarn install

  echo "Epoch $i" installed

  # reset epoch

  yarn ts-node --transpile-only -r tsconfig-paths/register packages/dev/scripts/build-prepare-epoch.ts 0 --skip-clean-repo-check

  # commit new lock file

  if [[ $i == "0" ]]; then

    # commit dev lock file, if it has changed.

    if ! git diff --exit-code --name-only yarn.lock; then

      git add yarn.lock && git commit -m "yarn.lock updated  --  automated"

    fi

  else

    # epoch lock file is updated, if it has changed

    epochLockFile=yarn.epoch.$i.lock
      
    if ! cmp -s yarn.lock $epochLockFile; then
    
      cp yarn.lock $epochLockFile

      git add $epochLockFile && git commit -m "Epoch $i updated  --  automated"
      
    fi

    # reset yarn.lock

    git checkout yarn.lock
  fi


done