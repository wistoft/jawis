import { assert, err } from "^jab";
import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const dataSize = 8;

  for (let size = 1; size < 50; size++) {
    const heap = getSharedPageHeap(prov, { size, dataSize });

    // allocate all

    const allocs: any[] = [];

    for (let i = 0; i < size; i++) {
      const alloc = heap.allocate(Uint8Array);
      allocs.push(alloc);

      assert(alloc.array.length === dataSize);

      //fill

      alloc.array.fill(i + 1);

      //size

      prov.eq(i + 1, heap.count);
    }

    //verify and deallocate

    for (let i = 0; i < size; i++) {
      const alloc = allocs[i];
      const chunk = allocs[i].array as Uint8Array;

      if (chunk.some((val) => val !== i + 1)) {
        err("Data is wrong", { size, i });
      }

      heap.deallocate(alloc.ref);

      //size

      prov.eq(size - i - 1, heap.count);
    }
  }
};
