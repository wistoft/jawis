import { TestProvision } from "^jarun";
import { getSharedChunkHeap_2_chuncks_per_page } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap_2_chuncks_per_page(prov);

  prov.log("empty", heap.toString());

  const a = heap.allocate(Int32Array);
  a.array.fill(4);

  prov.log("one element", heap.toString(false));

  const b = heap.allocate(Int32Array);
  b.array.fill(7);

  prov.log("two elements", heap.toString(false));

  const c = heap.allocate(Int32Array);
  c.array.fill(9);

  prov.log("three elements", heap.toString(false));

  //clean up

  heap.deallocate(a.ref);
  heap.deallocate(b.ref);
  heap.deallocate(c.ref);

  heap.dispose();
};
