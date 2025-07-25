import { AbsoluteFile } from "./internal";

export type WaitFunc = (
  typedArray: Int32Array,
  index: number,
  value: number,
  timeout?: number
) => "ok" | "not-equal" | "timed-out";

export type Diagnostic = {
  file: AbsoluteFile;
  message: string;
  line?: number | string;
  column?: number;
  severity?: "error" | "warning";
};

//
// not found in official places
//

export interface Jsonable {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | Jsonable
    | JsonableArray
    | undefined;
}

type JsonableArray = Array<
  string | number | boolean | Date | Jsonable | JsonableArray
>;

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/**
 * - only partial
 */
export type TypedArrayContructor<T> = {
  new (length: number): T;
  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T;
  readonly BYTES_PER_ELEMENT: number;
};
