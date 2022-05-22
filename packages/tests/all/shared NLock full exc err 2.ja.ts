import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get full exclusive lock when holding individual exclusive.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  try {
    lock.getFullExclusive();
  } finally {
    lock.releaseExclusive(0, key);
  }
};
