import { assertInt, makeTypedArray } from "^jab";
import { BufferStore } from "^shared-algs";

import { HeaderUtil, HeaderUtilDeps, MetaData, MetaDataDeps } from "./internal";

export type AppendOnlyBufferStoreDeps = {
  sharedArray: Uint8Array;
  byteSize: number;
  direction: "left" | "right";
} & MetaDataDeps &
  HeaderUtilDeps;

/**
 * - Delete is only logically. Deleted nodes will still take space in memory.
 * - Can store the heap in left or right direction. Meaning the heap grows from a fix point in either
 *      left or right direction.
 *
 * memory layout (from fix point)
 *  meta data (from left)
 *    4 bytes     buffer count
 *    4 bytes     used bytes
 *  buffers (repeated)
 *
 * right buffers layout (from fix point)
 *   header (from left)
 *      1 byte    header length
 *      1 byte    memory alignment (1, 2, 4 or 8)
 *      1 byte    version (for integrity)
 *      4 bytes   buffer length
 *      x bytes   padding
 *   data (from left)
 *      n bytes
 *
 * structure of reference (heighest bits first)
 *  28 bits   buffer index
 *   4 bits   integrity version
 *
 * impl
 *  - Free pointer points at the first unused byte.
 *  - Index is the position of the header in the array. In left direction, the data is to the left and
 *    the header is to the right. In right direction, both data and header is to the right of the index.
 *  - Left and right direction will not yield symmetric memory layout.
 *    - The reason a symmetry isn't desirable is the header is used to align the data's left edge. But we don't
 *      know if the sharedArray has 8-byte aligned right edge. It's also too burdensome to write the data in reverse
 *      direction, and without benefit. Also there's no benefit of writing the header in reverse direction.
 *    - In left direction, the header and data section are ordered the same seen from left. As the right is seen from right.
 *      But the data within the two sections is still stored from left to right.
 *
 *
 * notes
 *  - Only supports Uint8Array. But support for other sizes is started.
 *
 * todo
 *  - There is only need for a lock when adding, because only this operation needs to update meta data.
 *    - But what about delete and get? They interfere
 *
 * notes on resize
 *  - To keep it simple resize is not possible. In order to support resize, a map: `ref => index` is needed.
 *    So references returned to user can be remapped to new indexes on resize.
 *  - Would it be possible to return indexes to the user instead, and then have a cut of, where indexes above
 *    are remapped. This way it's a single operation to determine if a value is remapped, and
 *    the remapping could be partial: `invalid index => valid index`. Compaction would not be possible in
 *    this design, or at least more complex.
 *
 */
export class AppendOnlyBufferStore implements BufferStore {
  public metaData: MetaData;
  public headerUtil: HeaderUtil;

  /**
   *
   */
  constructor(public deps: AppendOnlyBufferStoreDeps) {
    assertInt(deps.byteSize);

    this.metaData = new MetaData(deps);
    this.headerUtil = new HeaderUtil(deps);
  }

  /**
   * partial
   */
  public pack = () => {
    return {
      // this random in test-fixtures, so better to send to remote thread.
      direction: this.deps.direction,
      byteSize: this.deps.byteSize,
      sharedArray: this.deps.sharedArray,
      initialized: true,
    } satisfies Partial<AppendOnlyBufferStoreDeps>;
  };

  /**
   *
   */
  get count() {
    return this.metaData.getCount();
  }

  /**
   *
   */
  public get = (ref: number) => {
    const index = this.headerUtil.decodeRef(ref);

    const { bufferLength, headerLength } = this.headerUtil.get(index);

    const dataIndex = this.headerUtil.getDataIndex(
      index,
      bufferLength,
      headerLength
    );

    return makeTypedArray(
      this.deps.sharedArray,
      Uint8Array,
      dataIndex,
      bufferLength
    );
  };

  /**
   *
   */
  public add = (buffer: Uint8Array) => {
    const { ref, index, headerData } = this._allocHelper(buffer);

    const dataIndex = this.headerUtil.getDataIndex(
      index,
      buffer.length,
      headerData.length
    );

    //write header

    this.headerUtil.set(index, headerData);

    //write data

    this.deps.sharedArray.set(buffer, dataIndex);

    return ref;
  };

  /**
   * Throws when reference is unknown or already deleted.
   */
  public delete = (ref: number) => {
    const metaKey = this.metaData.lock.getExclusive();

    this.metaData.decCount(metaKey);

    this.headerUtil.delete(ref); //todo: does not need the lock

    this.metaData.lock.releaseExclusive(metaKey);
  };

  /**
   *
   * notes
   *  - it's not possible to have count as just an atomic variable, because free pointer
   *    can't be updated atomically. But we could update free pointer optimistically with retry.
   */
  private _allocHelper = (buffer: Uint8Array) => {
    const metaKey = this.metaData.lock.getExclusive();

    this.metaData.incCount(metaKey);

    const version = Math.floor(Math.random() * 15) + 1; //max 4 bits, and never zero.

    const headerData = this.headerUtil.prepare(
      this.metaData.getFreePointer(metaKey),
      {
        version,
        bufferLength: buffer.length,
        alignment: Uint8Array.BYTES_PER_ELEMENT,
      }
    );

    //check storage

    const neededStorage = headerData.length + buffer.length;

    if (neededStorage > this.deps.byteSize) {
      throw new Error("Data exceeds storage size: " + this.deps.byteSize + ", needed: " + neededStorage); // prettier-ignore
    }

    const oldFreePointer = this.metaData.tryMoveFreePointer(
      neededStorage,
      metaKey
    );

    //ensure we can get from the reference to the index.

    const { index, ref } = this.headerUtil.encode(oldFreePointer, version);

    //unlock

    this.metaData.lock.releaseExclusive(metaKey);

    return { ref, index, headerData };
  };
}
