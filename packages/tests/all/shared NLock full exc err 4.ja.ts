import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//full exclusive must be released.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.getFullExclusive();
};
