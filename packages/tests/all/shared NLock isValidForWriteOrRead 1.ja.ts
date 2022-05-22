import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//shared isn't valid for write.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  const key = lock.getShared(0);

  prov.chk(lock.isValidForRead(0, key)); //same index
  prov.chk(!lock.isValidForRead(1, key)); //other index

  prov.chk(!lock.isValidForWrite(0, key as any)); //same index
  prov.chk(!lock.isValidForWrite(1, key as any)); //other index

  lock.releaseShared(0, key);
};
