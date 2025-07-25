import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

//get entry that doesn't exist.

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov);

  store.get(123456);
};
