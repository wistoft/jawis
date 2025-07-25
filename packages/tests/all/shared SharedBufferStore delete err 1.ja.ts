import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

//delete entry that doesn't exist.

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov);

  store.delete(123456);
};
