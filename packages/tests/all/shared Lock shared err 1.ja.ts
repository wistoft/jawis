import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//shared lock must be released.

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  lock.getShared();
};
