import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov, {
    pageSize: 24,
    dataSize: 4,
  });

  const a1 = heap.allocate(Uint32Array);
  const a2 = heap.allocate(Uint32Array);
  const a3 = heap.allocate(Uint32Array);

  heap.deallocate(a2.ref);

  const a4 = heap.allocate(Uint32Array);

  //clean up

  heap.deallocate(a1.ref);
  heap.deallocate(a3.ref);
  heap.deallocate(a4.ref);

  heap.dispose();
};
