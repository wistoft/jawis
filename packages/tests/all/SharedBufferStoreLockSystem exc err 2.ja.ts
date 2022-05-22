import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get exclusive when entry-read lock.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);
  const refKey = locks.getEntryShared(0);

  try {
    locks.getExclusive();
  } finally {
    locks.releaseEntryShared(0, refKey);
  }
};
