import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//exclusive lock must be released

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.getExclusive(0);
};
