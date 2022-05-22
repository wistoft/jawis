import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//all re-entrant locks must be released.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getExclusive();

  const key2 = lock.getExclusive(key);

  lock.releaseExclusive(key2);
};
