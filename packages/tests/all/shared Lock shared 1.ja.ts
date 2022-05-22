import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//a single thread can hold multiple shared keys.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  //first

  const key = lock.getShared();
  prov.chk(lock.isValidForRead(key));

  prov.chk(!lock.thisThreadHoldsNoLock());

  //second

  const key2 = lock.getShared();
  prov.chk(lock.isValidForRead(key));
  prov.chk(lock.isValidForRead(key2));

  prov.chk(!lock.thisThreadHoldsNoLock());

  //first

  lock.releaseShared(key);
  prov.chk(!lock.isValidForRead(key));
  prov.chk(lock.isValidForRead(key2));

  prov.chk(!lock.thisThreadHoldsNoLock());

  //second

  lock.releaseShared(key2);

  prov.chk(!lock.isValidForRead(key));
  prov.chk(!lock.isValidForRead(key2));

  prov.chk(lock.thisThreadHoldsNoLock());
};
