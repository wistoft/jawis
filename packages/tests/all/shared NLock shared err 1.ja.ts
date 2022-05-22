import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//shared lock must be released

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.getShared(0);
};
