import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

// must be unlocked when it is deallocated.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  try {
    lock.deallocate(0);
  } finally {
    lock.releaseExclusive(0, key);
  }
};
