import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//exclusive lock

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getExclusive(0);

  prov.chk(lock.isValidForRead(0, key)); //same index
  prov.chk(!lock.isValidForRead(1, key)); //other index

  prov.chk(lock.isValidForWrite(0, key)); //same index
  prov.chk(!lock.isValidForWrite(1, key)); //wrong index

  lock.releaseExclusive(0, key);
};
