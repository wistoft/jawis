import { TestProvision } from "^jarun";
import { SharedChunkHeap } from "^shared-algs";

export default (prov: TestProvision) => {
  const test = (available: number, dataSize: number) => {
    const blockSize = 4;
    const overhead = 1;

    return SharedChunkHeap.getMaxChunksPerNode(
      blockSize,
      overhead,
      available,
      dataSize
    );
  };

  prov.eq(0, test(5, 2));
  prov.eq(1, test(6, 2));
  prov.eq(1, test(7, 2));
  prov.eq(2, test(8, 2));
  prov.eq(2, test(9, 2));
  prov.eq(3, test(10, 2));
  prov.eq(3, test(11, 2));
  prov.eq(4, test(12, 2));
  prov.eq(4, test(13, 2));
  prov.eq(4, test(14, 2));
  prov.eq(4, test(15, 2));
  prov.eq(4, test(16, 2));
  prov.eq(4, test(17, 2));
  prov.eq(5, test(18, 2));
  prov.eq(5, test(19, 2));
  prov.eq(6, test(20, 2));
  prov.eq(6, test(21, 2));
  prov.eq(7, test(22, 2));
  prov.eq(7, test(23, 2));
  prov.eq(8, test(25, 2));
  prov.eq(8, test(26, 2));
  prov.eq(8, test(27, 2));
  prov.eq(8, test(28, 2));
  prov.eq(8, test(29, 2));
  prov.eq(9, test(30, 2));
};
