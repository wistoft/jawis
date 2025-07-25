import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { pageSize: 64, dataSize: 8 });

  const a1 = heap.allocate(Int32Array);
  const a2 = heap.allocate(Int32Array);

  //check length

  prov.eq(new Int32Array(2), a1.array);

  //check data is persisted

  a1.array.fill(7);
  a2.array.fill(9);

  prov.chk(a1.array.every((val) => val === 7));
  prov.chk(a2.array.every((val) => val === 9));

  //done

  heap.deallocate(a1.ref);
  heap.deallocate(a2.ref);

  heap.dispose();
};
