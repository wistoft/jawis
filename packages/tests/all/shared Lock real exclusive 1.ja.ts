import { assert } from "^jab";

import { TestProvision } from "^jarun";
import { getLock, makeLockMain, startOtherLock } from "^tests/_fixture";

//get exclusive when other thread initially holds exclusive

export default async (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getExclusive();

  assert(lock.isExclusiveLocked(), "Should be locked");

  const onMessage = () => {
    console.log("releasing");
    lock.releaseExclusive(key);
  };

  await startOtherLock(prov, __filename, lock, onMessage);

  assert(lock.isExclusiveLocked(), "Should be locked"); //the other thread didn't release
};

/**
 *
 */
export const main = makeLockMain((lock, prov) => {
  assert(lock.isExclusiveLocked(), "Should be locked");

  prov.beeSend({}); //make the other release.

  lock.getExclusive();

  assert(lock.isExclusiveLocked(), "Should be locked");

  console.log("got the lock");
});
