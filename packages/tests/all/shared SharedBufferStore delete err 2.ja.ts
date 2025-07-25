import { TestProvision } from "^jarun";
import { data1, getAppendOnlyBufferStore } from "^tests/_fixture";

//deleting a value twice

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov);

  const ref = store.add(data1);

  store.delete(ref);
  store.delete(ref);
};
