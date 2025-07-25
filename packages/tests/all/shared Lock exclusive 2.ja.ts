import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//exclusive key after shared is released.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  //make old stuff.

  const key = lock.getShared();
  lock.releaseShared(key);

  prov.chk(!lock.isValidForRead(key));
  prov.chk(lock.thisThreadHoldsNoLock());

  //now test

  const key2 = lock.getExclusive();

  prov.chk(!lock.isValidForRead(key));
  prov.chk(lock.isValidForWrite(key2));
  prov.chk(!lock.thisThreadHoldsNoLock());

  //release

  lock.releaseExclusive(key2);

  prov.chk(!lock.isValidForRead(key));
  prov.chk(!lock.isValidForWrite(key2));
  prov.chk(lock.thisThreadHoldsNoLock());
};
