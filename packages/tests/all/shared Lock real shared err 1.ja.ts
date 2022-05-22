import { assert } from "^jab";

import { TestProvision } from "^jarun";
import { getLock, makeLockTestMain, startOtherLock } from "^tests/_fixture";

//get shared when other thread holds exclusive (timeout)

export default async (prov: TestProvision) => {
  const lock = getLock(prov);

  const key2 = lock.getExclusive();

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

  lock.getShared();
});
