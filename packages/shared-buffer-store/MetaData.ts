import {
  ExclusiveKey,
  ReadWriteLock,
  ReadWriteLockDeps,
  LockSharedArrayLength,
  SharedLockBytes,
} from "^shared-lock";
import { makeTypedArray } from "^jab";

export type MetaDataDeps = {
  sharedArray: Uint8Array;
  byteSize: number;
  direction: "left" | "right";

  //internal: used for unpack. (default: false)
  initialized?: boolean;
} & Omit<ReadWriteLockDeps<any>, "type" | "sharedArray">;

export const BUFFER_COUNT_OFFSET = 0;
export const BYTE_USAGE_OFFSET = BUFFER_COUNT_OFFSET + 1;
export const LOCK_OFFSET = BYTE_USAGE_OFFSET + 1;
const lockLength = SharedLockBytes / Uint32Array.BYTES_PER_ELEMENT;

export const META_DATA_LENGTH = LOCK_OFFSET + lockLength;
export const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 *
 * todo
 *  - CUR_USAGE_OFFSET is the amount of used bytes. Not directly the same as the free pointer.
 *    Just have the free pointer directly
 */
export class MetaData {
  public lock: ReadWriteLock<"meta">;
  private metaDataBuffer: Uint32Array;

  /**
   *
   */
  constructor(public deps: MetaDataDeps) {
    if (this.deps.direction === "right") {
      this.metaDataBuffer = makeTypedArray(this.deps.sharedArray, Uint32Array, 0, META_DATA_LENGTH); // prettier-ignore
    } else {
      this.metaDataBuffer = makeTypedArray(this.deps.sharedArray, Uint32Array, this.deps.byteSize - META_DATA_BYTES, META_DATA_LENGTH); // prettier-ignore
    }

    this.lock = new ReadWriteLock({
      ...deps,
      type: "meta",
      sharedArray: makeTypedArray(
        this.metaDataBuffer,
        Int32Array,
        LOCK_OFFSET * Uint32Array.BYTES_PER_ELEMENT,
        LockSharedArrayLength
      ),
    });

    if (!deps.initialized) {
      this.metaDataBuffer[BUFFER_COUNT_OFFSET] = 0;
      this.metaDataBuffer[BYTE_USAGE_OFFSET] = META_DATA_BYTES;
    }
  }

  /**
   *
   */
  getCount = () => this.metaDataBuffer[BUFFER_COUNT_OFFSET];

  /**
   *
   */
  incCount(key: ExclusiveKey<"meta">) {
    this.lock.assertValidForWrite(key);

    this.metaDataBuffer[BUFFER_COUNT_OFFSET]++;
  }

  /**
   *
   */
  decCount(key: ExclusiveKey<"meta">) {
    this.lock.assertValidForWrite(key);

    this.metaDataBuffer[BUFFER_COUNT_OFFSET]--;
  }

  /**
   * Move the free pointer, so there is made the amount of space available.
   *
   */
  public tryMoveFreePointer = (amount: number, key: ExclusiveKey<"meta">) => {
    this.lock.assertValidForWrite(key);

    const curUsage = this.metaDataBuffer[BYTE_USAGE_OFFSET];

    if (curUsage + amount > this.deps.byteSize) {
      throw new Error("overflow not impl.");
    }

    let old;

    if (this.deps.direction === "right") {
      old = curUsage;
    } else {
      old = this.deps.byteSize - curUsage;
    }

    this.metaDataBuffer[BYTE_USAGE_OFFSET] += amount;

    return old;
  };

  /**
   * Returns the index of the free pointer
   */
  public getFreePointer = (key: ExclusiveKey<"meta">) => {
    this.lock.assertValidForWrite(key);

    if (this.deps.direction === "right") {
      return this.metaDataBuffer[BYTE_USAGE_OFFSET];
    } else {
      return this.deps.byteSize - this.metaDataBuffer[BYTE_USAGE_OFFSET];
    }
  };
}
