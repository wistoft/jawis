import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//re-entrant lock must be released before parent.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getExclusive();

  const key2 = lock.getExclusive(key);

  prov.catch(() => lock.releaseExclusive(key));

  //release correctly

  lock.releaseExclusive(key2);
  lock.releaseExclusive(key);
};
