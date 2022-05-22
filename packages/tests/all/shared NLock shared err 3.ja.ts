import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get shared lock when holding exclusive

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  try {
    lock.getShared(0);
  } finally {
    lock.releaseExclusive(0, key);
  }
};
