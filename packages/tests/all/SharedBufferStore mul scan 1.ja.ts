import { getRandomUint8Array } from "^jab";
import { TestProvision } from "^jarun";
import { data1, getSharedBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, {
    byteSize: 1000,
  });

  for (let amount = 0; amount < 30; amount++) {
    const refs: Array<[number, any]> = [];

    //add to heap

    for (let i = 0; i < amount; i++) {
      const array = getRandomUint8Array(10);

      refs.push([store.add(array), array]);
    }

    // delete again

    for (const [ref, array] of refs) {
      new TextEncoder().encode("data");

      prov.eq(array, store.get(ref));

      store.delete(ref);
    }

    //check

    prov.eq(0, store.length);
  }
};
