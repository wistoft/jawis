import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const exc = lock.getFullExclusive();

  lock.releaseFullExclusive(exc);
};
