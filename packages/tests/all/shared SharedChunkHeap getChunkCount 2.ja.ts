import { TestProvision } from "^jarun";
import { SharedChunkHeap } from "^shared-algs";

export default (prov: TestProvision) => {
  const test = (available: number, dataSize: number) => {
    const blockSize = 1;
    const overhead = 4;

    return SharedChunkHeap.getMaxChunksPerNode(
      blockSize,
      overhead,
      available,
      dataSize
    );
  };

  prov.eq(4, test(56, 8));
};
