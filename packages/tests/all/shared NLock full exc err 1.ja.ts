import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get full exclusive lock when holding full exclusive.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const exc = lock.getFullExclusive();

  try {
    lock.getFullExclusive();
  } finally {
    lock.releaseFullExclusive(exc);
  }
};
