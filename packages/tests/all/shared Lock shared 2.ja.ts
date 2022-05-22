import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//shared key after exclusive is released.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  //make old stuff.

  const key = lock.getExclusive();
  lock.releaseExclusive(key);

  prov.chk(!lock.isValidForWrite(key));
  prov.chk(lock.thisThreadHoldsNoLock());

  //now test

  const key2 = lock.getShared();

  prov.chk(!lock.isValidForWrite(key));
  prov.chk(lock.isValidForRead(key2));
  prov.chk(!lock.thisThreadHoldsNoLock());

  //release

  lock.releaseShared(key2);

  prov.chk(!lock.isValidForWrite(key));
  prov.chk(!lock.isValidForRead(key2));
  prov.chk(lock.thisThreadHoldsNoLock());
};
