import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get exclusive by using existing meta lock.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const metaKey = locks.metaWriteLock.getExclusive();
  try {
    const key = locks.getExclusive(metaKey);
    locks.releaseExclusive(key);
  } finally {
    locks.metaWriteLock.releaseExclusive(metaKey);
  }
};
