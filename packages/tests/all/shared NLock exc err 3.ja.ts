import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get exclusive lock when holding same shared.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getShared(0);

  try {
    lock.getExclusive(0);
  } finally {
    lock.releaseShared(0, key);
  }
};
