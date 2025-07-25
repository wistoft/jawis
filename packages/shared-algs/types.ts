import { TypedArray, TypedArrayContructor } from "^jab";

export const UINT32_UNDEFINED = 0xffffffff;
export const INT32_UNDEFINED = 0x7fffffff;

export type Allocation<T extends TypedArray> = { ref: number; array: T };

/**
 *
 */
export type DataNode = {
  ref: number;
  data: Uint8Array;
};

/**
 *
 * - First reference must be 1, so zero can be used as null value.
 *    - Most should use 0xffffffff as null, however, because things are often 0-indexed.
 */
export type FixedSizeHeap = {
  readonly dataSize: number; //size in bytes
  readonly count: number;
  /**
   *
   */
  pack: () => unknown;

  /**
   *
   */
  get: <A extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<A>
  ) => A;

  /**
   *
   */
  allocate: <A extends TypedArray>(
    TypedArray: TypedArrayContructor<A>,
    zeroFill?: boolean
  ) => Allocation<A>;

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
export type DoublyLinkedListProv<N> = Iterable<N> & {
  readonly count: number;

  /**
   *
   */
  getHead: () => N | undefined;

  /**
   *
   */
  get: (ref: number) => N;

  /**
   *
   */
  prevRef: (node: N) => number | undefined;

  /**
   *
   */
  nextRef: (node: N) => number | undefined;

  /**
   * Append new node at the end of the list.
   */
  appendNew: () => N;

  /**
   * Creates a new node after the given node.
   */
  insertNew: (pos: N) => N;

  /**
   *
   */
  move: (node: N, pos: N, before?: boolean) => void;

  /**
   *
   */
  delete: (node: N) => void;
};

/**
 * - There is usually one global page heap.
 * - Will return the same heap for calls with same dataSize
 */
export type HeapFactory = {
  /**
   *
   */
  pack: () => unknown;

  /**
   *
   */
  get: (dataSize: number) => FixedSizeHeap;
};

/**
 *
 */
export type BufferStore = {
  readonly count: number;

  /**
   *
   */
  pack: () => unknown;

  /**
   *
   */
  get: (ref: number) => Uint8Array;

  /**
   *
   */
  add: (buffer: Uint8Array) => number;

  /**
   *
   */
  delete: (ref: number) => void;
};

/**
 *
 */
export type TreeMap<K, V> = Iterable<[K, V]> & {
  readonly size: number; //rename to count

  /**
   *
   */
  get: (key: K) => V | undefined;

  /**
   *
   */
  has: (key: K) => boolean;

  /**
   *
   */
  set: (key: K, value: V) => void;

  /**
   *
   */
  delete: (key: K) => void;

  /*
   *
   */
  dispose: () => void;
};

/**
 *
 */
export type TreeSet<K> = Iterable<K> & {
  readonly size: number; //rename to count

  /**
   *
   */
  has: (key: K) => boolean;

  /**
   *
   */
  add: (key: K) => void;

  /**
   *
   */
  delete: (key: K) => void;

  /*
   *
   */
  dispose: () => void;
};
