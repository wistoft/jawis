import { once } from "^jab";
import { TestProvision } from "^jarun";
import { data1, data2, getSharedBufferStore } from "^tests/_fixture";

//get when pruning.

export default (prov: TestProvision) => {
  const { store, release } = getSharedBufferStore(prov);

  const ref1 = store.add(data1);
  const ref2 = store.add(data2);
  const ref3 = store.add(data1); //ensure ref2 is overwritten on prune.
  store.delete(ref1); //ensure something to prune.

  release.current = once(() => {
    prov.eq(data2, store.get(ref2));
  });

  //now the test

  store._prune();

  prov.eq(2, store.length);

  //clean up

  store.delete(ref2);
  store.delete(ref3);
};
