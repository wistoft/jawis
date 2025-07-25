import { err } from "^jab";
import { TestProvision } from "^jarun";
import { SharedChunkHeap } from "^shared-algs";
import { getSharedChunkHeap } from "^tests/_fixture";

//allocate after previous has been free'ed.

export default (prov: TestProvision) => {
  const pageSize = 32;
  const maxUsage = 8; //todo

  for (let dataSize = 1; dataSize <= maxUsage; dataSize *= 2) {
    const heap = getSharedChunkHeap(prov, { pageSize, dataSize });

    const amount = pageSize / dataSize; //ensure overflow.

    for (let i = 0; i < amount; i++) {
      allocateAndDeallocate(amount, heap);
      allocateAndDeallocate(amount, heap); //reallocate
    }

    heap.dispose();
  }
};

const allocateAndDeallocate = (amount: number, heap: SharedChunkHeap) => {
  // allocate

  const allocs: any[] = [];

  for (let i = 0; i < amount; i++) {
    const alloc = heap.allocate(Uint8Array);
    allocs.push(alloc);

    //fill

    alloc.array.fill(i + 1);
  }

  //verify and deallocate

  for (let i = 0; i < amount; i++) {
    const alloc = allocs[i];
    const chunk = allocs[i].array as Uint8Array;

    if (chunk.some((val) => val !== (i + 1) % 256)) {
      err("Data is wrong", { i });
    }

    heap.deallocate(alloc.ref);
  }
};
