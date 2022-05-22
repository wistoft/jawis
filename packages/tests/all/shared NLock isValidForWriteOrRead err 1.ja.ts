import { TestProvision } from "^jarun";
import { getNLock } from "^tests/_fixture";

//unknown index

export default (prov: TestProvision) => {
  const lock = getNLock(prov);

  lock.isValidForRead(10, {} as any);
};
