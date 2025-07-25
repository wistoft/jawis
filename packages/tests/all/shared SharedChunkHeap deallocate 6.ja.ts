import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const a2 = heap.allocate(Uint32Array);
  const a3 = heap.allocate(Uint32Array);
  const a4 = heap.allocate(Uint32Array);

  heap.deallocate(a4.ref);
  heap.deallocate(a3.ref);
  heap.deallocate(a2.ref);

  heap.dispose();
};
