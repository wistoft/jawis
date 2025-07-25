import { getRandomUint8Array_old } from "^jab";
import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov, {
    byteSize: 2000,
  });

  for (let amount = 0; amount < 10; amount++) {
    const refs: Array<[number, any]> = [];

    //add to heap

    for (let i = 0; i < amount; i++) {
      const array = getRandomUint8Array_old(10);

      refs.push([store.add(array), array]);
    }

    // delete again

    for (const [ref, array] of refs) {
      prov.eq(array, store.get(ref));

      store.delete(ref);
    }

    //check

    prov.eq(0, store.count);
  }
};
