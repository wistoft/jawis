import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

//double deallocate (when chunk is reused)

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const first = heap.allocate(Uint32Array);

  heap.deallocate(first.ref);

  //test

  for (let i = 0; i < 10; i++) {
    const b = heap.allocate(Uint32Array); //put a new chunk at deleted position.

    try {
      heap.deallocate(first.ref); //illegal
    } catch (error) {
      heap.deallocate(b.ref); //clean up
      heap.dispose();
      return; //test passed.
    }

    //must have been the same version, so error wasn't detected, but b was wrongly deleted.
  }

  throw new Error("Should throw (with some probability)");
};
