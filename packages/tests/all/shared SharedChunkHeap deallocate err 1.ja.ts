import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

//double deallocate

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const a = heap.allocate(Uint32Array);

  try {
    heap.deallocate(a.ref);
    heap.deallocate(a.ref);
  } finally {
    heap.dispose();
  }
};
