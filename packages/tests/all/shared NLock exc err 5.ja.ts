import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//release exclusive with wrong index. (other is unlocked)

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  try {
    lock.releaseExclusive(1, key);
  } finally {
    lock.releaseExclusive(0, key);
  }
};
