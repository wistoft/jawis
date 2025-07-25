import { TestProvision } from "^jarun";
import { makeMakeNode } from "^shared-algs";

//get node array, that doesn't divide node data size

export default (prov: TestProvision) => {
  const makeNode = makeMakeNode({
    dataSize: 64,
    metaDataSize: 12,
    NodeTypedArray: BigInt64Array,
    TypedArray: BigInt64Array,
  });

  makeNode({
    ref: 0,
    data: new Uint8Array(),
  });
};
