import { TestProvision } from "^jarun";
import { getSharedListHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedListHeap(prov, { dataSize: 8 });

  const { ref, array } = heap.allocate(Int32Array);

  //check length

  prov.eq(new Int32Array(2), array);
  prov.eq(1, heap.count);

  //check data is persisted

  array.fill(10);

  prov.chk(array.every((val) => val === 10));

  //done

  heap.deallocate(ref);
  prov.eq(0, heap.count);
};
