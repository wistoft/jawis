import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get meta when holding meta

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const metaKey = locks.metaWriteLock.getExclusive();

  try {
    locks.metaWriteLock.getExclusive();
  } finally {
    locks.metaWriteLock.releaseExclusive(metaKey);
  }
};
