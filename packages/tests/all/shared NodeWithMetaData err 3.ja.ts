import { TestProvision } from "^jarun";
import { makeMakeNode } from "^shared-algs";

//get data array, that doesn't divide data size

export default (prov: TestProvision) => {
  const makeNode = makeMakeNode({
    dataSize: 12,
    metaDataSize: 8,
    NodeTypedArray: Int8Array,
    TypedArray: BigInt64Array,
  });

  makeNode({
    ref: 0,
    data: new Uint8Array(32),
  });
};
