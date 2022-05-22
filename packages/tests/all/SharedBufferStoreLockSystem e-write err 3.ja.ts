import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get entry-write when holding entry-write

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);

  const key = locks.getEntryExclusive(0);

  try {
    locks.getEntryExclusive(0);
  } finally {
    locks.releaseEntryExclusive(0, key);
  }
};
