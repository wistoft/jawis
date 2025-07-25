import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//can allocate other than Int32Array

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { dataSize: 8 });

  const { ref, array } = heap.allocate(Int8Array);

  //check length

  prov.eq(new Int8Array(8), array);

  //done

  heap.deallocate(ref);

  heap.dispose();
};
