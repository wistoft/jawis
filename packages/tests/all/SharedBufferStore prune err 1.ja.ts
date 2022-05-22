import { TestProvision } from "^jarun";
import { data1, getSharedBufferStore } from "^tests/_fixture";

//prune on first add

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, { byteSize: 20 });

  store.add(data1);
};
