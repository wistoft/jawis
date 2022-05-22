import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get exclusive when holding meta.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const metaKey = locks.metaWriteLock.getExclusive();

  locks.metaWriteLock.releaseExclusive(metaKey);
};
