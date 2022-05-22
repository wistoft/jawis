import { def, err, getRandomUint8Array } from "^jab";
import { Allocation, SharedChunkHeap, SharedBufferStore } from "^jab-node";
import { TestProvision } from "^jarun";
import { getSharedChunkHeap, getSharedBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const refs: Array<[number, Uint8Array]> = [];
  const trace: string[] = [];

  const { store } = getSharedBufferStore(prov, {
    byteSize: 1000,
  });

  for (let amount = 1; amount < 20; amount++) {
    for (let repeats = 0; repeats < 1; repeats++) {
      testCase(amount);
    }
  }

  //
  //functions
  //

  /**
   *
   */
  function testCase(amount: number) {
    try {
      //increase tree

      for (let i = 0; i < amount; i++) {
        add();
        add();
        remove();
      }

      //stable

      for (let i = 0; i < amount; i++) {
        add();
        remove();
      }

      //decrease

      for (let i = 0; i < amount; i++) {
        remove();
        add();
        remove();
      }

      //empty again

      prov.eq(0, store.length);
    } catch (error) {
      console.log(trace.join("\n"));
      throw error;
    }

    /**
     *
     */
    function add() {
      const array = getRandomUint8Array(10);

      trace.push("store.add(the data);");

      const ref = store.add(array);

      //add to state

      refs.push([ref, array]);
    }

    /**
     *
     */
    function remove() {
      const index = Math.floor(refs.length * Math.random());
      const [ref, expectedArray] = refs[index];

      const array = store.get(ref);

      prov.eq(expectedArray, array);

      //delete

      trace.push("store.delete(" + ref + ");");

      store.delete(ref);

      //remove from state

      refs.splice(index, 1);
    }
  }
};
