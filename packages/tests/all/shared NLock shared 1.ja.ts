import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//get shared lock when holding shared

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  //first

  const key = lock.getShared(0);
  prov.chk(lock.isValidForRead(0, key));

  //second

  const key2 = lock.getShared(0);
  prov.chk(lock.isValidForRead(0, key));
  prov.chk(lock.isValidForRead(0, key2));

  //first

  lock.releaseShared(0, key);
  prov.chk(!lock.isValidForRead(0, key));
  prov.chk(lock.isValidForRead(0, key2));

  //second

  lock.releaseShared(0, key2);
  prov.chk(!lock.isValidForRead(0, key));
  prov.chk(!lock.isValidForRead(0, key2));
};
