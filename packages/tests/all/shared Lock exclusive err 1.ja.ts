import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//re-entrant lock requires the existing key.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getExclusive();
  prov.catch(() => lock.getExclusive());

  lock.releaseExclusive(key);
};
