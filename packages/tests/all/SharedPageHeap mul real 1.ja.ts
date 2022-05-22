import { assert, assertEq, err, makeSend } from "^jab";

import { TestProvision } from "^jarun";
import {
  data1,
  getLock,
  getSharedPageHeap,
  makeHeapTestMain,
  makeLiveJacs_lazy,
  makeLockTestMain,
  startOtherLock,
} from "^tests/_fixture";

export default async (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov, { size: 10, dataSize: 8 });

  const alloc = heap.allocate(Uint32Array);

  alloc.array.fill(7);

  await makeLiveJacs_lazy(prov, __filename, {
    heap: heap.pack(),
    ref: alloc.ref,
  });

  if (alloc.array.some((val) => val !== 8)) err("Data is wrong");
};

/**
 *
 */
export const main = makeHeapTestMain((heap, data) => {
  assertEq(heap.count, 1);

  const array = heap.get(data.ref, Uint32Array);

  if (array.some((val) => val !== 7)) err("Data is wrong", { array });

  array.fill(8);
});
