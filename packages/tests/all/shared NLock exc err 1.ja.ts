import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get exclusive lock when holding full exclusive.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const exc = lock.getFullExclusive();

  try {
    lock.getExclusive(0);
  } finally {
    lock.releaseFullExclusive(exc);
  }
};
