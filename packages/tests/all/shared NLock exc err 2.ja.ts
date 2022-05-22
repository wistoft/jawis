import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get exclusive lock when holding same exclusive.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  try {
    lock.getExclusive(0);
  } finally {
    lock.releaseExclusive(0, key);
  }
};
