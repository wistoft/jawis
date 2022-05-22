import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//support re-entrant lock.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);
  const key2 = lock.getExclusive(0, key);

  lock.releaseExclusive(0, key2);
  lock.releaseExclusive(0, key);
};
