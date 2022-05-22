import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const index = lock.allocate();

  const key = lock.getExclusive(index);

  lock.releaseExclusive(index, key);

  lock.deallocate(index);
};
