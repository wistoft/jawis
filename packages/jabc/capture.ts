export type ClonedArray = ["value", ClonedValue[]];

export type ClonedValue =
  | null
  | boolean
  | number
  | string
  | { [_: string]: ClonedValue }
  | ClonedValueNonPrimitive;

export type ClonedObjectNonPlain = {
  protoChain: string[];
  fields: { [_: string]: ClonedValue };
  toStringValue?: string;
};

export type ClonedTypedArray = {
  type: string;
  length: number;
  base64: string; //only part of the data.
};

export type CustomClone = (value: unknown) => null | { replace: ClonedValue };

export type ClonedValueNonPrimitive =
  | ["undefined"]
  | ["Infinity"]
  | ["NaN"]
  | ["circular"]
  | ["MaxDepth"]
  | ["bigint", string]
  | ["symbol", string]
  | ["date", string]
  | ["function", string]
  | ["set", ClonedValue]
  | ["map", ClonedValue]
  | ["value", Array<ClonedValue>]
  | ["ArrayBuffer", number]
  | ["SharedArrayBuffer", number]
  | ["DataView", number]
  | ["TypedArray", ClonedTypedArray]
  | ["object", ClonedObjectNonPlain]
  | ["promise", ClonedPromisePending]; //from clone async.

export type ClonedPromisePending = {
  resolve?: ClonedValue;
  reject?: ClonedValue;
  timeout?: string;
};
