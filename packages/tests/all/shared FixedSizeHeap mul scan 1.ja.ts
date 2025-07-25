import { assert, err, getRandomRange } from "^jab";
import { TestProvision } from "^jarun";
import {
  getSharedChunkHeap,
  getSharedListHeap,
  getSharedTreeHeap,
} from "^tests/_fixture";
import { Allocation, FixedSizeHeap } from "^shared-algs";

export default (prov: TestProvision) => {
  const dataSize = 8;
  const pageSize = dataSize * getRandomRange(4, 10);

  for (let maxSize = 1; maxSize <= 50; maxSize++) {
    const h1 = getSharedTreeHeap(prov, { maxSize, dataSize });
    const h2 = getSharedListHeap(prov, { maxSize, dataSize });
    const h3 = getSharedChunkHeap(prov, { pageSize, dataSize });

    test(prov, maxSize, dataSize, h1);
    test(prov, maxSize, dataSize, h2);
    test(prov, maxSize, dataSize, h3);

    h3.dispose();
  }
};

const test = (
  prov: TestProvision,
  maxSize: number,
  dataSize: number,
  heap: FixedSizeHeap
) => {
  // allocate all

  const allocs: Allocation<Uint8Array>[] = [];

  for (let i = 0; i < maxSize; i++) {
    const alloc = heap.allocate(Uint8Array);
    allocs.push(alloc);

    assert(alloc.array.length === dataSize);

    //fill

    alloc.array.fill(i + 1);

    //size

    prov.eq(i + 1, heap.count);
  }

  //verify and deallocate

  for (let i = 0; i < maxSize; i++) {
    const array = heap.get(allocs[i].ref, Uint8Array);

    if (array.some((val) => val !== i + 1)) {
      err("Data is wrong", { size: maxSize, i });
    }

    heap.deallocate(allocs[i].ref);

    //size

    prov.eq(maxSize - i - 1, heap.count);
  }
};
