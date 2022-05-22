import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//release exclusive with wrong index. (other is locked)

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);
  const key2 = lock.getExclusive(1);

  try {
    lock.releaseExclusive(1, key);
  } finally {
    lock.releaseExclusive(0, key);
    lock.releaseExclusive(1, key2);
  }
};
