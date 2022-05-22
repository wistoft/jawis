import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get exclusive when holding meta lock.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const metaKey = locks.metaWriteLock.getExclusive();
  try {
    locks.getExclusive();
  } finally {
    locks.metaWriteLock.releaseExclusive(metaKey);
  }
};
