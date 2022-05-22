import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const key = locks.getExclusive();

  locks.releaseExclusive(key);
};
