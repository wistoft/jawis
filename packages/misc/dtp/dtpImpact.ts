import path from "node:path";

import { assert } from "^jab";

/**
 *
 */
export const dtp = (
  cache: string[][],
  invalidFiles: string[],
  absTestFolder: string,
  tests: Map<string, number>,
  directImpact: Map<string, Set<string> | undefined>
) => {
  const seen = new Set<string>(); //for dedup test cases.
  let currentLevelIds = invalidFiles;
  let currentLevelNumber = 0; // same as `result.length`
  let maxNonEmptyLevel = 0;
  let nextLevel: string[];

  const result: string[][] = [];

  while (currentLevelIds.length > 0 || currentLevelNumber < cache.length) {
    nextLevel = [];
    const testsInLevel: string[] = [];

    //
    //remembered impact
    //

    for (const relFile of cache[currentLevelNumber] || []) {
      const absFile = path.join(absTestFolder, relFile);

      const tmp = tests.get(absFile);

      if (tmp === undefined) {
        //the test must have been deleted
        continue;
      }

      if (tmp !== -1) {
        //test still invalid, so add to result.

        if (seen.has(absFile)) {
          continue;
        }

        if (tmp !== currentLevelNumber) {
          console.log({
            tmp,
            currentLevelNumber,
            relFile,
            absFile,
            tests,
            cache,
            invalidFiles,
          });
        }

        assert(tmp === currentLevelNumber, undefined, {
          tmp,
          currentLevelNumber,
        }); // the level can only have changed to valid.

        seen.add(absFile);

        testsInLevel.push(relFile);
      }
    }

    //
    //new impact
    //

    for (const absFile of currentLevelIds) {
      if (seen.has(absFile)) {
        continue;
      }

      seen.add(absFile);

      //handle tests

      if (tests.has(absFile)) {
        testsInLevel.push(path.relative(absTestFolder, absFile));

        tests.set(absFile, currentLevelNumber); // store extra place. (for flexibility)

        //tests aren't processed further
        continue;
      }

      //handle code units

      const impacts = directImpact.get(absFile);

      if (!impacts) {
        continue;
      }

      for (const impact of impacts) {
        nextLevel.push(impact);
      }
    }

    //
    // level is done
    //

    // checks to avoid empty arrays in output.

    if (testsInLevel.length > 0) {
      maxNonEmptyLevel = currentLevelNumber + 1;
    }

    //add level to result

    result.push(testsInLevel);
    currentLevelNumber++;

    //prepare for next level

    currentLevelIds = nextLevel;
  }

  //remove trailing empty levels and return.

  return result.slice(0, maxNonEmptyLevel);
};
