import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  lock._lockMaster();
  lock._unlockMaster();
};
