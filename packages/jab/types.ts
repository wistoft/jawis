/**
 *
 */
export type LogProv = {
  /**
   * for logging javascript variables.
   */
  log: (...args: Array<unknown>) => void;

  /**
   * for logging things like stdout.
   */
  logStream: (logName: string, value: string | Uint8Array) => void;

  /**
   * for reporting status.
   */
  status: (type: string, status: string) => void;
};

/**
 *
 */
export type FinallyProv = {
  finally: FinallyFunc;
  runFinally: () => Promise<void>;
};

export type FinallyFunc = (
  func: () => void | undefined | Promise<void>
) => void;

//
// not found in official places
//

export interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray | undefined;
}

type JsonArray = Array<string | number | boolean | Date | Json | JsonArray>;

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
