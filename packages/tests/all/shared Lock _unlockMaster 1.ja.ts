import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//unlock master without having the lock.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  lock._unlockMaster();
};
