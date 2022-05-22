import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get full exclusive lock when holding individual shared.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getShared(0);

  try {
    lock.getFullExclusive();
  } finally {
    lock.releaseShared(0, key);
  }
};
