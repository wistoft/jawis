export type CapturedArray = ["value", CapturedValue[]];

export type CapturedValue =
  | null
  | boolean
  | number
  | string
  | { [_: string]: CapturedValue }
  | CapturedNonPrimitiveValue;

export type CapturedNonPlainObject = {
  protoChain: string[];
  fields?: { [_: string]: CapturedValue };
  toStringValue?: string;
};

export type CapturedTypedArray = {
  type: string;
  length: number;
  base64: string; //only part of the data.
};

export type CustomCapture = (
  value: unknown
) => null | { replace: CapturedValue };

export type CapturedNonPrimitiveValue =
  | ["undefined"]
  | ["Infinity"]
  | ["NaN"]
  | ["circular"]
  | ["MaxDepth"]
  | ["bigint", string]
  | ["symbol", string]
  | ["date", string]
  | ["function", string]
  | ["resource", string]
  | ["set", CapturedValue]
  | ["map", CapturedValue]
  | ["value", Array<CapturedValue>]
  | ["ArrayBuffer", number]
  | ["SharedArrayBuffer", number]
  | ["DataView", number]
  | ["TypedArray", CapturedTypedArray]
  | ["object", CapturedNonPlainObject]
  | ["promise", PendingCapturedPromise] //used in capture async.
  | ["partial", CapturedValue];

export type PendingCapturedPromise = {
  resolve?: CapturedValue;
  reject?: CapturedValue;
  timeout?: string;
};
