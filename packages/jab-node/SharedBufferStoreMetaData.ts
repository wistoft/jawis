import { err } from "^jab";

import {
  ExclusiveKey,
  FixedSizeHeap,
  MakeHeap,
  SharedKey,
  Uint32TreeMap,
} from "^jab-node";
import { SharedBufferStoreLockSystem } from "./SharedBufferStoreLockSystem";

type Deps = {
  metaDataBuffer: Uint32Array;
  byteSize: number;
  direction: "left" | "right";
  sabByteSize: number;
  locks: SharedBufferStoreLockSystem;
  makeHeap: MakeHeap;
};

export const LENGTH_OFFSET = 0; //number of entries.
const LENGTH_LENGTH = 1;

export const CUR_USAGE_OFFSET = LENGTH_OFFSET + LENGTH_LENGTH;
const CUR_USAGE_LENGTH = 1;

export const REF_MAX_OFFSET = CUR_USAGE_OFFSET + CUR_USAGE_LENGTH;
const REF_MAX_LENGTH = 1;

export const REF_TO_INDEX_MAP_ROOT_OFFSET = REF_MAX_OFFSET + REF_MAX_LENGTH;
const REF_TO_INDEX_MAP_ROOT_LENGTH = 1;

export const REF_TO_LOCK_INDEX_MAP_ROOT_OFFSET = REF_TO_INDEX_MAP_ROOT_OFFSET + REF_TO_INDEX_MAP_ROOT_LENGTH; // prettier-ignore
const REF_TO_LOCK_INDEX_MAP_ROOT_LENGTH = 1;

export const META_DATA_LENGTH = (REF_TO_LOCK_INDEX_MAP_ROOT_OFFSET + REF_TO_LOCK_INDEX_MAP_ROOT_LENGTH); // prettier-ignore
export const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH; // prettier-ignore

/**
 *
 */
export class SharedBufferStoreMetaData {
  private refToIndexMap: Uint32TreeMap;

  /**
   *
   */
  constructor(public deps: Deps) {
    this.deps.metaDataBuffer[LENGTH_OFFSET] = 0;
    this.deps.metaDataBuffer[CUR_USAGE_OFFSET] = META_DATA_BYTES;
    this.deps.metaDataBuffer[REF_MAX_OFFSET] = 0;

    this.refToIndexMap = new Uint32TreeMap({
      ...deps,
      verifyAfterOperations: false,
    });
  }

  /**
   * impl
   *  - is it overkill to require lock?
   */
  public getLength = (
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    return this.deps.metaDataBuffer[LENGTH_OFFSET];
  };

  /**
   * could be done Atomics.add
   */
  public getNextReference = (
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    return ++this.deps.metaDataBuffer[REF_MAX_OFFSET];
  };

  /**
   * Move the free pointer, so there is made the amount of space available.
   *
   *  - The old free pointer.
   *
   * impl
   *  - store firstEntryLength
   */
  public tryMoveFreePointer = (
    amount: number,
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    const curUsage = this.deps.metaDataBuffer[CUR_USAGE_OFFSET];

    if (curUsage + amount > this.deps.byteSize) {
      return;
    }

    let old;

    if (this.deps.direction === "right") {
      old = curUsage;
    } else {
      old = this.deps.sabByteSize - curUsage;
    }

    this.deps.metaDataBuffer[CUR_USAGE_OFFSET] += amount;

    return old;
  };

  /**
   * Returns the index of the
   */
  public getFreePointer = (
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    if (this.deps.direction === "right") {
      return this.deps.metaDataBuffer[CUR_USAGE_OFFSET];
    } else {
      return this.deps.sabByteSize - this.deps.metaDataBuffer[CUR_USAGE_OFFSET];
    }
  };

  /**
   *
   */
  public setFreePointer = (
    index: number,
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    if (this.deps.direction === "right") {
      this.deps.metaDataBuffer[CUR_USAGE_OFFSET] = index;
    } else {
      this.deps.metaDataBuffer[CUR_USAGE_OFFSET] = this.deps.sabByteSize - index; // prettier-ignore
    }
  };

  /**
   *
   */
  public refToIndex = (ref: number, refKey: SharedKey<"entry">) => {
    this.deps.locks.assertEntryRead(refKey, ref);

    return this.refToIndexMap.get(ref);
  };

  /**
   *
   */
  public deleteRefToIndex = (
    ref: number,
    key: ExclusiveKey<"meta">,
    refKey: ExclusiveKey<"entry">
  ) => {
    this.deps.locks.assertMeta(key);
    this.deps.locks.assertEntryWrite(refKey, ref);

    this.refToIndexMap.delete(ref);
    this.deps.metaDataBuffer[LENGTH_OFFSET]--;
    this.invariant(key);
  };

  /**
   * impl
   *  - only used when no entry exists, so doesn't need to check for entry lock.
   */
  public addRefToIndex = (
    ref: number,
    index: number,
    key: ExclusiveKey<"meta">,
    refKey: ExclusiveKey<"entry">
  ) => {
    this.deps.locks.assertMeta(key);
    this.deps.locks.assertEntryWrite(refKey, ref);

    this.refToIndexMap.set(ref, index);
    this.deps.metaDataBuffer[LENGTH_OFFSET]++;
    this.invariant(key);
  };

  /**
   *
   */
  public updateRefToIndex = (
    ref: number,
    index: number,
    key: ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.exclusiveLock.assertValidForWrite(key);

    this.refToIndexMap.set(ref, index);
    this.invariant(key);
  };

  /**
   * Must be called when we change `length` or `refToIndexMap`.
   *
   * locking
   *  - The change on these must be atomic, so other thread concurrently can check this invariant.
   */
  private invariant = (
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    this.deps.locks.assertMeta(key);

    if (this.deps.metaDataBuffer[LENGTH_OFFSET] !== this.refToIndexMap.size) {
      err("Wrong size", {
        heap: this.deps.metaDataBuffer[LENGTH_OFFSET],
        refToIndexMap: this.refToIndexMap.size,
      });
    }
  };
}
