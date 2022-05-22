import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get full after shared is released.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getShared(0);
  lock.releaseShared(0, key);

  const exc = lock.getFullExclusive();

  lock.releaseFullExclusive(exc);
};
