import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//release twice

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  const key = lock.getExclusive();

  lock.releaseExclusive(key);
  lock.releaseExclusive(key);
};
