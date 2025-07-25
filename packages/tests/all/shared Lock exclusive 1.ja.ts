import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//support re-entrant lock.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  //take outer key.

  const key = lock.getExclusive();

  prov.chk(lock.isValidForRead(key)); //exclusive is also valid for shared operations.
  prov.chk(lock.isValidForWrite(key));

  prov.chk(!lock.thisThreadHoldsNoLock());

  //re-entry

  const key2 = lock.getExclusive(key);

  prov.chk(!lock.isValidForRead(key));
  prov.chk(!lock.isValidForWrite(key)); //stops to be valid, because of child.

  prov.chk(lock.isValidForRead(key2));
  prov.chk(lock.isValidForWrite(key2));

  prov.chk(!lock.thisThreadHoldsNoLock());

  //release inner

  lock.releaseExclusive(key2);

  prov.chk(lock.isValidForRead(key));
  prov.chk(lock.isValidForWrite(key)); //valid again

  prov.chk(!lock.isValidForRead(key2));
  prov.chk(!lock.isValidForWrite(key2)); //now invalid

  prov.chk(!lock.thisThreadHoldsNoLock());

  //release outer

  lock.releaseExclusive(key);

  prov.chk(!lock.isValidForRead(key));
  prov.chk(!lock.isValidForWrite(key)); //now also invalid.

  prov.chk(!lock.isValidForRead(key2));
  prov.chk(!lock.isValidForWrite(key2));

  prov.chk(lock.thisThreadHoldsNoLock()); //unlocked again.
};
