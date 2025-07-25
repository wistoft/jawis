import { assert } from "^jab";

import { TestProvision } from "^jarun";
import { getLock, makeLockMain, startOtherLock } from "^tests/_fixture";

//get exclusive when other thread holds shared

export default async (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getShared();

  assert(lock.isShareLocked(), "Should be locked");

  try {
    await startOtherLock(prov, __filename, lock);
  } finally {
    lock.releaseShared(key);
  }
};

/**
 *
 */
export const main = makeLockMain((lock) => {
  assert(lock.isShareLocked(), "Should be locked");

  lock.getExclusive();
});
