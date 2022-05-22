import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get meta when holding exclusive

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const key = locks.getExclusive();
  try {
    locks.metaWriteLock.getExclusive();
  } finally {
    locks.releaseExclusive(key);
  }
};
