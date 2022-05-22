import { assert } from "^jab";

import { TestProvision } from "^jarun";
import { getLock, makeLockTestMain, startOtherLock } from "^tests/_fixture";

//get exclusive when other thread holds exclusive (timeout)

export default async (prov: TestProvision) => {
  const lock = getLock(prov);

  const key2 = lock.getExclusive();

  assert(lock.isExclusiveLocked(), "Should be locked");

  try {
    await startOtherLock(prov, __filename, lock);
  } finally {
    lock.releaseExclusive(key2);
  }
};

/**
 *
 */
export const main = makeLockTestMain((lock) => {
  assert(lock.isExclusiveLocked(), "Should be locked");

  lock.getExclusive();
});
