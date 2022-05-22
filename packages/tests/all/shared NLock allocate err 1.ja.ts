import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

// allocate too many indexes

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.allocate();
  lock.allocate();
};
