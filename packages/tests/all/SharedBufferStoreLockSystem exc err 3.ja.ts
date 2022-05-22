import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get exclusive when holding entry-write lock.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);
  const refKey = locks.getEntryExclusive(0);

  try {
    locks.getExclusive();
  } finally {
    locks.releaseEntryExclusive(0, refKey);
  }
};
