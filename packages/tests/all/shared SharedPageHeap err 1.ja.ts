import { TestProvision } from "^jarun";
import { SharedTreeHeap } from "^shared-page-heap";

// dataSize is not multiple of 4

export default (prov: TestProvision) => {
  new SharedTreeHeap({
    maxSize: 2,
    dataSize: 65,
    sharedArray: new Int32Array(),
    useChunkVersion: true,
  });
};
