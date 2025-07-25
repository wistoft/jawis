import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const a = heap.allocate(Uint8Array);
  const b = heap.allocate(Uint8Array);
  const c = heap.allocate(Uint8Array);

  heap.deallocate(c.ref);

  const d = heap.allocate(Uint8Array);
  const e = heap.allocate(Uint8Array);
  const f = heap.allocate(Uint8Array);

  heap.deallocate(f.ref);

  //clean up

  heap.deallocate(a.ref);
  heap.deallocate(b.ref);
  heap.deallocate(d.ref);
  heap.deallocate(e.ref);

  heap.dispose();
};
