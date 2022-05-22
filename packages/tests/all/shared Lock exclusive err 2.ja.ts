import { TestProvision } from "^jarun";
import { getLock } from "^tests/_fixture";

//key must be released

export default (prov: TestProvision) => {
  const lock = getLock(prov);

  lock.getExclusive();
};
