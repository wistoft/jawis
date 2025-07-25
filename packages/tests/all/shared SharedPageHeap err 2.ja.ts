import { TestProvision } from "^jarun";
import { SharedTreeHeap } from "^shared-page-heap";

// sharedArray is wrong size

export default (prov: TestProvision) => {
  new SharedTreeHeap({
    maxSize: 2,
    dataSize: 8,
    sharedArray: new Int32Array(),
    useChunkVersion: true,
  });
};
