import { assert, def, TypedArray, TypedArrayContructor } from "^jab";

import { SharedBufferStore } from "./SharedBufferStore";
import { LinkedListNode } from "./SharedDoublyLinkedList";

export const UINT32_UNDEFINED = 0xffffffff;

export type WaitFunc = (
  typedArray: Int32Array,
  index: number,
  value: number,
  timeout?: number
) => "ok" | "not-equal" | "timed-out";

export type Allocation<T extends TypedArray> = { ref: number; array: T };

export type MakeHeap = (dataSize: number) => FixedSizeHeap;

/**
 *
 */
export type ParentHeap = {
  makeHeap: MakeHeap;
};

/**
 *
 * - First reference must be 1, so zero can be used as null value.
 *    - But that isn't really meaningfull, because things are often 0-indexed.
 *    - So use 0xffffffff as null.
 */
export type FixedSizeHeap = {
  readonly dataSize: number; //size in bytes
  readonly count: number;

  /**
   *
   */
  get: <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => T;

  /**
   *
   */
  allocate: <T extends TypedArray>(
    TypedArray: TypedArrayContructor<T>,
    zeroFill?: boolean
  ) => Allocation<T>;

  /**
   *
   */
  deallocate: (ref: number) => void;

  /**
   *
   */
  toString?: () => string;
};

/**
 *
 */
export type TreeMap<K, V> = {
  size: number;

  /**
   *
   */
  get: (key: K) => V | undefined;

  /**
   *
   */
  set: (key: K, value: V) => void;

  /**
   *
   */
  delete: (key: K) => void;
};

/**
 *
 */
export type DoublyLinkedListProv = Iterable<LinkedListNode<any, any>> & {
  count: number;

  /**
   *
   */
  getHead: <T extends TypedArray, U extends TypedArray>(
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => LinkedListNode<T, U> | undefined;

  /**
   *
   */
  get: <T extends TypedArray, U extends TypedArray>(
    ref: number,
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => LinkedListNode<T, U>;

  /**
   *
   */
  getNodeDataArray: <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => T;

  /**
   *
   */
  getDataArray: <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => T;

  /**
   *
   */
  prevRef: (node: LinkedListNode<any, any>) => number | undefined;

  /**
   *
   */
  nextRef: (node: LinkedListNode<any, any>) => number | undefined;

  /**
   * Append new node at the end of the list.
   */
  appendNew: <T extends TypedArray, U extends TypedArray>(
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => LinkedListNode<T, U>;

  /**
   * Creates a new node after the given node.
   */
  insertNew: <T extends TypedArray, U extends TypedArray>(
    pos: LinkedListNode<any, any>,
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => LinkedListNode<T, U>;

  /**
   *
   */
  move: (
    node: LinkedListNode<any, any>,
    pos: LinkedListNode<any, any>,
    before?: boolean
  ) => void;

  /**
   *
   */
  delete: (node: LinkedListNode<any, any>) => void;
};

/**
 * Round up to divisible by four.
 *
 * @source https://www.npmjs.com/package/sharedmap
 */
export function align32(v: number) {
  return (v & 0xffffffffffffc) + (v & 0x3 ? 0x4 : 0);
}

/**
 *
 * - sleepCondition is only used to check if the wait should continue in case of spurious wake.
 *    That's different from the condition for waiting. Though they could be the same.
 */
export function niceWait({
  sharedArray,
  index,
  value,
  timeout,
  softTimeout,
  sleepCondition,
  onSoftTimeout,
  waitName = "Wait",
  throwOnTimeout = false,
  wait = Atomics.wait,
  DateNow,
}: {
  sharedArray: Int32Array;
  index: number;
  value: number;
  timeout: number;
  softTimeout: number | undefined;
  sleepCondition: () => boolean;
  onSoftTimeout: () => void;
  waitName?: string;
  throwOnTimeout?: boolean | string;
  wait: WaitFunc;
  DateNow: () => number;
}) {
  if (softTimeout && softTimeout >= timeout) {
    throw new Error("Soft timeout " + softTimeout+" must be smaller than hard timeout: " + timeout); // prettier-ignore
  }

  const startTime = DateNow();
  let val: "ok" | "timed-out" | "not-equal";
  let actualTimeout: number | undefined = softTimeout || timeout;
  let hasBeenSoftTimeout = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    val = wait(sharedArray, index, value, actualTimeout); // prettier-ignore

    //give warning on first timeout

    if (val === "timed-out" && softTimeout && !hasBeenSoftTimeout) {
      //give warning

      onSoftTimeout();

      //setup to wait for next timeout

      actualTimeout = timeout - softTimeout;
      hasBeenSoftTimeout = true;
      continue;
    }

    //protect against spurious wake

    if (val === "ok" && sleepCondition()) {
      continue;
    }

    break;
  }

  //tell if wait responsed between first and second timeout

  if (val !== "timed-out" && hasBeenSoftTimeout) {
    console.log(waitName + " responded late, time: " + (DateNow() - startTime));
  }

  if (val === "timed-out" && throwOnTimeout) {
    // const msg =
    //   typeof throwOnTimeout === "string"
    //     ? throwOnTimeout
    //     : waitName + " time out.";

    throw new Error(
      waitName + " did not respond, time: " + (DateNow() - startTime)
    );
  }

  return val;
}

/**
 *
 * - Writes little endian, because that's easiest.
 * - only uses one byte per element, even if Uint16Array.
 * - Checks that the number isn't truncated.
 */
export const writeNumber = (
  target: Uint8Array | Uint16Array,
  offset: number,
  value: number,
  numBytes: number,
  errorMessage = "Not enough space for value."
) => {
  let tmp = value;

  for (let i = 0; i < numBytes; i++) {
    target[offset + i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  assert(tmp === 0, errorMessage, {
    value,
    tmp,
    numBytes,
  });
};

/**
 *
 */
export const readNumber = (
  source: Uint8Array | Uint16Array,
  offset: number,
  numBytes: number
) => {
  let value = 0;
  let shift = 0;

  for (let i = 0; i < numBytes; i++) {
    value += def(source[offset + i] << shift);
    shift += 8;
  }

  return value;
};

/**
 * todo: should be able to use 'equal' library.
 */
export const equal = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

/**
 * MurmurHash2 for binary data.
 *
 * @source  https://github.com/mmomtchev/SharedMap
 */
export function murmurHash2(data: Uint8Array) {
  const UINT32_UNDEFINED = 0xffffffff; //not needed, becauce SharedMap does modulo maxSize

  let l = data.length,
    h = 17 ^ l,
    i = 0,
    k;
  while (l >= 4) {
    k =
      (data[i] & 0xff) |
      ((data[++i] & 0xff) << 8) |
      ((data[++i] & 0xff) << 16) |
      ((data[++i] & 0xff) << 14);
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 14;
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k;
    l -= 4;
    ++i;
  }
  /* eslint-disable no-fallthrough */
  switch (l) {
    case 3:
      h ^= (data[i + 2] & 0xff) << 16;
    case 2:
      h ^= (data[i + 1] & 0xff) << 8;
    case 1:
      h ^= data[i] & 0xff;
      h =
        (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  }
  /* eslint-enable no-fallthrough */
  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;
  h = h >>> 0;
  return h != UINT32_UNDEFINED ? h : 1;
}

/**
 * ubrugt
 */
export const makeDeallocatableHeap = (heap: FixedSizeHeap) => {
  const allocations: ReturnType<FixedSizeHeap["allocate"]>[] = [];

  /**
   *
   */
  const allocate = <T extends Uint8Array | Uint16Array>(
    TypedArray: TypedArrayContructor<T>,
    zeroFill = true
  ) => {
    const allocation = heap.allocate(TypedArray, zeroFill);

    allocations.push(allocation);

    return allocation.array;
  };

  /**
   *
   */
  const dispose = () => {
    for (const allocation of allocations) {
      heap.deallocate(allocation.ref);
    }
  };

  return { allocate, dispose };
};
