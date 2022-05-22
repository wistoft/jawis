import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get entry-write when holding exclusive

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);

  const key = locks.getExclusive();

  try {
    locks.getEntryExclusive(0);
  } finally {
    locks.releaseExclusive(key);
  }
};
