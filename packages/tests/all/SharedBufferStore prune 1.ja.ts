import { TestProvision } from "^jarun";
import { data1, getSharedBufferStore } from "^tests/_fixture";

//prune can handle large reference numbers.

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov);

  (store as any).refMax = 1000000; //quick fix

  const ref1 = store.add(data1);

  //add/get

  const ref2 = store.add(data1);
  prov.eq(data1, store.get(ref2));
  prov.eq(2, store.length);

  //prune (todo)

  store.delete(ref1); //delete the first, so there prune will do something.

  store._prune();

  //overwrite deleted data. to ensure corruption
  const ref3 = store.add(new TextEncoder().encode("1234"));

  // tjek the moved element.

  prov.eq(data1, store.get(ref2));
  prov.eq(2, store.length);

  //clean up

  store.delete(ref2);
  store.delete(ref3);
};
