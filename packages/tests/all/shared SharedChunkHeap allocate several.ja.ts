import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//allocate on several pages

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  let allocs: any[] = [];
  const max = 10;

  for (let amount = 1; amount < max; amount++) {
    allocs = [];

    for (let i = 0; i < amount; i++) {
      const alloc = heap.allocate(Uint8Array);
      allocs.push(alloc);
    }

    for (let i = 0; i < amount; i++) {
      const alloc = allocs[i];

      heap.deallocate(alloc.ref);
    }
  }

  heap.dispose();
};
