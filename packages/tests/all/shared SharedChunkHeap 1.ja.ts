import { assert, err } from "^jab";
import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//allocate 4 full pages. For various dataSizes.

export default (prov: TestProvision) => {
  const pageSize = 64;
  const maxUsage = 16; //todo: outer node data is needed to goto 32
  const bytesToAllocate = 4 * pageSize;

  for (let dataSize = 1; dataSize <= maxUsage; dataSize *= 2) {
    const heap = getSharedChunkHeap(prov, { pageSize, dataSize });

    const amount = bytesToAllocate / dataSize;

    // allocate many

    const allocs: any[] = [];

    for (let i = 0; i < amount; i++) {
      const alloc = heap.allocate(Uint8Array);
      allocs.push(alloc);

      assert(alloc.array.length === dataSize, undefined, { alloc, dataSize });

      //fill

      alloc.array.fill(i + 1);
    }

    //verify and deallocate

    for (let i = 0; i < amount; i++) {
      const alloc = allocs[i];
      const chunk = allocs[i].array as Uint8Array;

      if (chunk.some((val) => val !== (i + 1) % 256)) {
        err("Data is wrong", { size: dataSize, i });
      }

      heap.deallocate(alloc.ref);
    }

    heap.dispose();
  }
};
