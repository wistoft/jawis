import { TestProvision } from "^jarun";
import { data1, data2, getSharedBufferStore } from "^tests/_fixture";

//prune can handle entries that overlap in target and source region.

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, {
    byteSize: 100,
  });

  const long = new TextEncoder().encode("a".repeat(40));

  const ref1 = store.add(data2);
  const ref2 = store.add(long); //it's so big, that some of its old storage will be reused.

  //prune

  store.delete(ref1); //delete the first, so there prune will do something.
  store._prune();

  // tjek the moved element.

  prov.eq(long, store.get(ref2));
  prov.eq(1, store.length);

  //clean up

  store.delete(ref2);
};
