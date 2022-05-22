import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

// indexes must be valid

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.deallocate(10);
};
