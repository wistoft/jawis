import { TestProvision } from "^jarun";
import { data1, data2, empty, getAppendOnlyBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov);

  //one element

  const ref1 = store.add(data1);
  prov.eq(data1, store.get(ref1));
  prov.eq(1, store.count);

  //two elements

  const ref2 = store.add(data2);
  prov.eq(data1, store.get(ref1));
  prov.eq(data2, store.get(ref2));
  prov.eq(2, store.count);

  //three elements

  const ref3 = store.add(empty);
  prov.eq(data1, store.get(ref1));
  prov.eq(data2, store.get(ref2));
  prov.eq(empty, store.get(ref3));
  prov.eq(3, store.count);

  //clean up

  store.delete(ref1);
  store.delete(ref2);
  store.delete(ref3);
};
