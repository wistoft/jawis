import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//get entry-read when holding entry-read is allowed.

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  locks.onNewEntry(0);

  const refKey1 = locks.getEntryShared(0);
  const refKey2 = locks.getEntryShared(0);

  locks.releaseEntryShared(0, refKey1);
  locks.releaseEntryShared(0, refKey2);
};
