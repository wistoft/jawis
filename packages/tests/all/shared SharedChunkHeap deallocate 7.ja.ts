import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

//deallocate on a node, that already is free head.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  const a = heap.allocate(Uint8Array);
  const b = heap.allocate(Uint8Array);
  const c = heap.allocate(Uint8Array); //new page

  heap.deallocate(a.ref);

  const d = heap.allocate(Uint8Array);

  prov.eq(0, (heap as any).freePointer.ref >>> 4); //pre condition: free head is on first page.

  heap.deallocate(d.ref);

  //clean up

  heap.deallocate(b.ref);
  heap.deallocate(c.ref);

  heap.dispose();
};
