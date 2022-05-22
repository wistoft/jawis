import { TestProvision } from "^jarun";
import { data1, getSharedBufferStore } from "^tests/_fixture";

//get after delete

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov);

  const ref = store.add(data1);

  store.delete(ref);
  store.get(ref);
};
