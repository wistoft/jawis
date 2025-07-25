import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

//deallocate just before a filled free head.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  //page 1

  const a = heap.allocate(Uint8Array);
  const b = heap.allocate(Uint8Array);

  //page 2

  const c = heap.allocate(Uint8Array);
  const d = heap.allocate(Uint8Array);

  //page 3

  const e = heap.allocate(Uint8Array);

  //move head to page 2

  heap.deallocate(c.ref);
  const f = heap.allocate(Uint8Array); //page 2 is still full

  //deallocate on page 1.

  heap.deallocate(a.ref);

  //clean up

  heap.deallocate(b.ref);
  heap.deallocate(d.ref);
  heap.deallocate(e.ref);
  heap.deallocate(f.ref);

  heap.dispose();
};
