import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get full after exclusive is released.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);
  lock.releaseExclusive(0, key);

  const exc = lock.getFullExclusive();

  lock.releaseFullExclusive(exc);
};
