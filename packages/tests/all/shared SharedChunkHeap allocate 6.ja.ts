import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

//free head is moved forward

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const a = heap.allocate(Uint8Array);
  const b = heap.allocate(Uint8Array);
  const c = heap.allocate(Uint8Array);

  heap.deallocate(a.ref); //free head is moved to first page.

  //moves free head forward to a parially filled page.

  const d = heap.allocate(Uint8Array);
  const e = heap.allocate(Uint8Array);

  //clean up

  heap.deallocate(b.ref);
  heap.deallocate(c.ref);
  heap.deallocate(d.ref);
  heap.deallocate(e.ref);

  heap.dispose();
};
