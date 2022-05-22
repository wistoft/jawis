import { TestProvision } from "^jarun";
import { getSharedBufferStoreLockSystem } from "^tests/_fixture";

//reentry not supported for exclusive

export default (prov: TestProvision) => {
  const locks = getSharedBufferStoreLockSystem(prov);

  const key = locks.getExclusive();

  try {
    locks.getExclusive();
  } finally {
    locks.releaseExclusive(key);
  }
};
