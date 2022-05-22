import { TestProvision } from "^jarun";
import { data1, getSharedBufferStore } from "^tests/_fixture";

//heap prunes on overflow

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, { byteSize: 40 });

  for (let i = 0; i < 10; i++) {
    const ref = store.add(data1); //overflow, if the heap wasn't auto-pruned.

    prov.eq(data1, store.get(ref)); //check it's added correctly.
    prov.eq(1, store.length);

    store.delete(ref);
    prov.eq(0, store.length);
  }
};
