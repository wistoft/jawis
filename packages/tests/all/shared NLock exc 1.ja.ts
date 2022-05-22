import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//two independent exclusive at the same time.

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  //first

  const key = lock.getExclusive(0);
  prov.chk(lock.isValidForRead(0, key));
  prov.chk(lock.isValidForWrite(0, key));

  //second

  const key2 = lock.getExclusive(1);
  prov.chk(lock.isValidForRead(0, key));
  prov.chk(lock.isValidForWrite(0, key));
  prov.chk(lock.isValidForRead(1, key2));
  prov.chk(lock.isValidForWrite(1, key2));

  //first

  lock.releaseExclusive(0, key);
  prov.chk(!lock.isValidForRead(0, key));
  prov.chk(!lock.isValidForWrite(0, key));
  prov.chk(lock.isValidForRead(1, key2));
  prov.chk(lock.isValidForWrite(1, key2));

  //second

  lock.releaseExclusive(1, key2);
  prov.chk(!lock.isValidForRead(0, key));
  prov.chk(!lock.isValidForWrite(0, key));
  prov.chk(!lock.isValidForRead(1, key2));
  prov.chk(!lock.isValidForWrite(1, key2));
};
