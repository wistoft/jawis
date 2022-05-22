import { def, err } from "^jab";
import { Allocation, SharedChunkHeap } from "^jab-node";
import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const array: Array<[Allocation<Uint8Array>, number]> = [];
  const trace: string[] = [];

  const pageSize = 64;
  const dataSize = 16;

  const heap = getSharedChunkHeap(prov, { pageSize, dataSize });

  for (let amount = 1; amount < 10; amount++) {
    for (let repeats = 0; repeats < 10; repeats++) {
      testCase(prov, heap, amount);
    }
  }

  //
  //functions
  //

  /**
   *
   */
  function testCase(
    prov: TestProvision,
    heap: SharedChunkHeap,
    amount: number
  ) {
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

      prov.eq(0, heap.count);
    } catch (error) {
      console.log(trace.join("\n"));
      throw error;
    }

    /**
     *
     */
    function add() {
      const n = Math.floor(256 * Math.random());
      let alloc;

      try {
        alloc = heap.allocate(Uint8Array);
        trace.push("let a" + alloc.ref + " = heap.allocate(Uint8Array);");
      } catch (error) {
        trace.push("heap.allocate(Uint8Array);");
        throw error;
      }

      alloc.array.fill(n);

      //add to state

      array.push([alloc, n]);
    }

    /**
     *
     */
    function remove() {
      const index = Math.floor(array.length * Math.random());
      const [alloc, n] = array[index];

      trace.push("heap.deallocate(" + alloc.ref + ");");

      const data = { n, ...alloc };

      if (alloc.array.some((val) => val !== n)) {
        err("Data is wrong", data);
      }

      const clone = heap.get(alloc.ref, Uint8Array);

      if (clone.some((val) => val !== n)) {
        err("Data is wrong in clone", { ...data, clone });
      }

      //remove from state

      heap.deallocate(alloc.ref);

      array.splice(index, 1);
    }
  }
};
