import { assert } from "^jab";

import { TestProvision } from "^jarun";
import { getLock, makeLockTestMain, startOtherLock } from "^tests/_fixture";

//get shared when other thread holds shared

export default async (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getShared();

  assert(lock.isShareLocked(), "Should be locked");

  await startOtherLock(prov, __filename, lock);

  lock.releaseShared(key);
};

/**
 *
 */
export const main = makeLockTestMain((lock) => {
  assert(lock.isShareLocked(), "Should be locked");

  const key = lock.getShared();

  assert(lock.isValidForRead(key), "Should be have lock.");
});
