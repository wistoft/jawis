import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get entry-write when holding entry-read

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);

  const key = locks.getEntryShared(0);

  try {
    locks.getEntryExclusive(0);
  } finally {
    locks.releaseEntryShared(0, key);
  }
};
