import { TypedArray, TypedArrayContructor, assert, makeTypedArray } from "^jab";
import { DataNode } from "./internal";

type Deps<T extends TypedArray, U extends TypedArray> = {
  metaDataSize: number;
  dataSize: number;
  NodeTypedArray: TypedArrayContructor<T>;
  TypedArray: TypedArrayContructor<U>;
};

/**
 *
 */
export type NodeWithMetaData<T extends TypedArray, U extends TypedArray> = {
  ref: number;
  metaData: T;
  data: U;
};

/**
 *
 */
export const makeMakeNode = <T extends TypedArray, U extends TypedArray>(
  deps: Deps<T, U>
) => {
  const DATA_BYTE_OFFSET = 0;
  const META_DATA_BYTE_OFFSET = deps.dataSize;

  return (node: DataNode): NodeWithMetaData<T, U> => {
    assert(Number.isInteger(deps.metaDataSize / deps.NodeTypedArray.BYTES_PER_ELEMENT), "NodeTypedArray must divide node data size: ", { NodeTypedArray: deps.NodeTypedArray, nodeDataSize: deps.metaDataSize }); // prettier-ignore

    const metaData = makeTypedArray(
      node.data,
      deps.NodeTypedArray,
      META_DATA_BYTE_OFFSET,
      deps.metaDataSize / deps.NodeTypedArray.BYTES_PER_ELEMENT
    );

    assert(Number.isInteger(deps.dataSize / deps.TypedArray.BYTES_PER_ELEMENT), "TypedArray must divide data size: ", { TypedArray: deps.TypedArray, dataSize: deps.dataSize }); // prettier-ignore

    const data = makeTypedArray(
      node.data,
      deps.TypedArray,
      DATA_BYTE_OFFSET,
      deps.dataSize / deps.TypedArray.BYTES_PER_ELEMENT
    );

    return {
      ref: node.ref,
      metaData,
      data,
    };
  };
};
