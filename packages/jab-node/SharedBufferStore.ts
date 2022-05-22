import { assertInt, err, TypedArray, TypedArrayContructor } from "^jab";

import {
  ExclusiveKey,
  FixedSizeHeap,
  LockSharedArrayLength,
  MakeHeap,
} from "^jab-node";
import {
  SharedBufferStoreLockSystem,
  SharedBufferStoreLockSystemDeps,
} from "./SharedBufferStoreLockSystem";
import { SharedBufferStoreEntryHeader } from "./SharedBufferStoreEntryHeader";
import {
  META_DATA_BYTES,
  META_DATA_LENGTH,
  SharedBufferStoreMetaData,
} from "./SharedBufferStoreMetaData";

export type SharedBufferStoreDeps = {
  byteSize: number;
  direction: "left" | "right";
  makeHeap: MakeHeap;
} & Omit<
  SharedBufferStoreLockSystemDeps,
  "exclusiveLockSharedArray" | "metaWriteSharedArray"
>;

/**
 *
 *  - Can store the heap i left or right direction. Meaning the heap grows from a fix point in either
 *      left or right direction.
 *
 * todo
 *  - assert all locks are released, when operations are done.
 *
 * spec
 *  - deleted entries are marked in access count cell by `count == INT_NULL`.
 *
 *  lock needs
 *    - locking system
 *    - locking meta data
 *      - refMax
 *      - curUsage (free space pointer)
 *      - length variable
 *    - locking entries
 *        - ref
 *        - ref in refToIndexMap
 *        - entry header
 *
 * memory layout (might be left or right direction)
 *  - uint32    length                amount of entries
 *  - uint32    free pointer          index of the fully free part.
 *  - uint32    refMax                the height reference return to the user.
 *  - uint32    refToIndexMapRoot
 *  - uint32    lockToIndexMapRoot
 *
 */
export class SharedBufferStore {
  private heapSab: SharedArrayBuffer;
  private heap: Uint8Array;

  private locks: SharedBufferStoreLockSystem;
  public meta: SharedBufferStoreMetaData;
  public header: SharedBufferStoreEntryHeader;

  /**
   *
   */
  constructor(public deps: SharedBufferStoreDeps) {
    assertInt(deps.byteSize);

    //data

    this.heapSab = new SharedArrayBuffer(deps.byteSize);

    this.heap = new Uint8Array(this.heapSab);

    //controllers

    this.locks = new SharedBufferStoreLockSystem({
      ...deps,
      exclusiveLockSharedArray: new Int32Array(new SharedArrayBuffer(LockSharedArrayLength * 4)), // prettier-ignore
      metaWriteSharedArray: new Int32Array(new SharedArrayBuffer(LockSharedArrayLength * 4)), // prettier-ignore
    });

    let metaDataBuffer;

    if (this.deps.direction === "right") {
      metaDataBuffer = new Uint32Array(this.heapSab, 0, META_DATA_LENGTH);
    } else {
      metaDataBuffer = new Uint32Array(this.heapSab, this.heapSab.byteLength - META_DATA_BYTES, META_DATA_LENGTH); // prettier-ignore
    }

    this.meta = new SharedBufferStoreMetaData({
      metaDataBuffer,
      sabByteSize: this.heapSab.byteLength,
      locks: this.locks,
      ...deps,
    });

    this.header = new SharedBufferStoreEntryHeader({
      heap: this.heap,
      sabByteSize: this.heapSab.byteLength,
      direction: this.deps.direction,
      locks: this.locks,
    });
  }

  /**
   *
   */
  get length() {
    const metaKey = this.locks.metaWriteLock.getExclusive();
    try {
      return this.meta.getLength(metaKey);
    } finally {
      this.locks.metaWriteLock.releaseExclusive(metaKey);
    }
  }

  /**
   * Returns a copy.
   *
   */
  public get = (ref: number) => {
    const refKey = this.locks.getEntryShared(ref);

    try {
      const index = this.meta.refToIndex(ref, refKey);

      if (index === undefined) {
        throw err("Impossible: because the lock is aquired");
      }

      const { dataLength, headerLength } = this.header.get(index, refKey, ref);

      const dataIndex = SharedBufferStoreEntryHeader.getDataIndex(
        index,
        dataLength,
        headerLength,
        this.deps.direction
      );

      return this.heap.slice(dataIndex, dataIndex + dataLength);
    } finally {
      this.locks.releaseEntryShared(ref, refKey);
    }
  };

  /**
   *
   * impl
   *  - Checks if there is space for the given number of bytes.
   *
   */
  public add = (buffer: Uint8Array) => {
    const metaKey = this.locks.metaWriteLock.getExclusive();

    const size = buffer.length;
    const alignment = Uint8Array.BYTES_PER_ELEMENT;

    try {
      //reference, that won't change when prune.

      const ref = this.meta.getNextReference(metaKey);

      //data

      let { oldFreePointer, header } = this._allocHelper(
        ref,
        alignment,
        size,
        metaKey
      );

      //header

      if (oldFreePointer === undefined) {
        this._prune(metaKey);

        const again = this._allocHelper(ref, alignment, size, metaKey); //called because curUsage has changed.

        oldFreePointer = again.oldFreePointer;
        header = again.header;

        //now we have to deal with the missing space externally

        if (oldFreePointer === undefined) {
          throw new Error("overflow not impl.");
        }
      }

      //prepare locks

      this.locks.onNewEntry(ref);

      const refKey = this.locks.getEntryExclusive(ref);

      try {
        //calculate index of the header.

        let index;

        if (this.deps.direction === "right") {
          index = oldFreePointer;
        } else {
          index =
            oldFreePointer - SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH;
        }

        const dataIndex = SharedBufferStoreEntryHeader.getDataIndex(
          index,
          size,
          header.length,
          this.deps.direction
        );

        //ensure we can get from the reference to the index.

        this.meta.addRefToIndex(ref, index, metaKey, refKey);

        //write header

        if (this.deps.direction === "right") {
          this.header.set(index, header, refKey, ref);
        } else {
          const indexCorrection = index + SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH - header.length; // prettier-ignore
          this.header.set(indexCorrection, header, refKey, ref);
        }

        //store data

        this.heap.set(buffer, dataIndex);

        return ref;
      } finally {
        this.locks.releaseEntryExclusive(ref, refKey);
      }
    } finally {
      this.locks.metaWriteLock.releaseExclusive(metaKey);
    }
  };

  /**
   * Throws when reference is unknown or already deleted.
   */
  public delete = (ref: number, outerRefKey?: ExclusiveKey<"entry">) => {
    const metaKey = this.locks.metaWriteLock.getExclusive();

    try {
      const refKey = this.locks.getEntryExclusive(ref, outerRefKey);

      try {
        const index = this.meta.refToIndex(ref, refKey);

        if (index === undefined) {
          throw new Error("Entry not found: " + ref);
        }

        this.meta.deleteRefToIndex(ref, metaKey, refKey);

        this.header.update(index, { deleted: true }, refKey, ref);
      } finally {
        this.locks.releaseEntryExclusive(ref, refKey);

        this.locks.onDeleteEntry(ref);
      }
    } finally {
      this.locks.metaWriteLock.releaseExclusive(metaKey);
    }
  };

  /**
   *
   */
  private _allocHelper = (
    ref: number,
    alignment: number,
    size: number,
    metaKey: ExclusiveKey<"meta">
  ) => {
    const header = this.header.prepare(this.meta.getFreePointer(metaKey), {
      accessCount: 0,
      deleted: false,
      ref,
      dataLength: size,
      alignment,
    });

    //check storage

    const neededStorage = header.length + size;

    if (neededStorage > this.deps.byteSize) {
      throw new Error("Data exceeds storage size: " + this.deps.byteSize + ", needed: " + neededStorage); // prettier-ignore
    }

    const oldFreePointer = this.meta.tryMoveFreePointer(neededStorage, metaKey);

    return { oldFreePointer, neededStorage, header };
  };

  /**
   * Call the make free space.
   *
   *  - Run through entries and compact by overwriting deleted entries.
   *
   * impl
   *  - It's not feasible to get a exclusive lock on the heap. Because users should be free to hold locks
   *      on entries as long as they desire. This means the heap can't be fully defragmented, with all entries
   *      at the beginning.
   *  - Fragmented free-space is normal operation, because we can't wait for locked entries.
   *  - public for tests.
   *
   * locking
   *  - It could be beneficial to lock creation of entry-locks in larger sections, to reduce waiting be each
   *      and every entry-lock. And then continually free the space, that is already processed.
   *  - We could still serve get-requests by making a copy of the data, which would take bounded time. Compared to
   *      given the user a lock on the entry.
   *  - We could allow concurrent allocation by having multiple free pointers. This means pruning will
   *      only block allocation in that specific free space. (and free spaces it might join with in the process of pruning.)
   */
  public _prune = (outerMetaKey?: ExclusiveKey<"meta">) => {
    let entryIndex = META_DATA_BYTES;
    let filledIndex = META_DATA_BYTES;
    let count = 0;

    //others for left direction

    if (this.deps.direction === "left") {
      filledIndex = this.meta.deps.sabByteSize - SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH; // prettier-ignore
      entryIndex = filledIndex;
    }

    const excKey = this.locks.getExclusive(outerMetaKey);

    try {
      while (count < this.meta.getLength(excKey)) {
        const { headerLength, deleted, alignment, ref, dataLength } =
          this.header.get(entryIndex, excKey);

        if (alignment !== 1) {
          throw new Error("not impl: pruning with alignment other than 1: " + alignment); // prettier-ignore
        }

        if (!deleted) {
          count++;

          //update reference to index map

          this.meta.updateRefToIndex(ref, filledIndex, excKey);

          //copy
          // todo: we fuck alignment up here.

          if (this.deps.direction === "right") {
            this.heap.copyWithin(
              filledIndex,
              entryIndex,
              entryIndex + headerLength + dataLength
            );
          } else {
            this.heap.copyWithin(
              filledIndex - dataLength,
              entryIndex - dataLength,
              entryIndex + headerLength
            );
          }

          //advance free-space pointer

          if (this.deps.direction === "right") {
            filledIndex += headerLength + dataLength;
          } else {
            filledIndex -= headerLength + dataLength;
          }
        }

        //goto next data entry.

        if (this.deps.direction === "right") {
          entryIndex += headerLength + dataLength;
        } else {
          entryIndex -= headerLength + dataLength;
        }
      }

      if (this.deps.direction === "right") {
        this.meta.setFreePointer(filledIndex, excKey);
      } else {
        this.meta.setFreePointer(filledIndex + SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH, excKey); // prettier-ignore
      }
    } finally {
      this.locks.releaseExclusive(excKey);
    }
  };
}
