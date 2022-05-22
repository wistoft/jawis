import { assert, err, tos, TypedArray, TypedArrayContructor } from "^jab";

import { SharedCompactBitTree, FixedSizeHeap } from "^jab-node";
import { assertEq } from "^jab/error";

export type SharedPageHeapDeps = {
  size: number;
  dataSize?: number;
  sharedArrayBuffer?: SharedArrayBuffer;
  unpack?: boolean; //default is initialize the shared array. (default: false)
};

/**
 *
 *
 */
export class SharedPageHeap implements FixedSizeHeap {
  //data

  private sharedArrayBuffer: SharedArrayBuffer;
  private tree: SharedCompactBitTree;

  //derived

  public readonly dataSize: number; // byte size of an allocation.

  //defaults

  private defaulDataSize = 1024; //multiple of 8 ensures all TypedArrays are aligned correctly.

  /**
   *
   * - Memory is allocated from one end, and it's possible to shrink memory back to maximal allocated reference.
   *
   */
  constructor(private deps: SharedPageHeapDeps) {
    deps.dataSize !== undefined && assert(deps.dataSize > 0, "Datasize must be positive: " + deps.dataSize); // prettier-ignore
    deps.size !== undefined && assert(this.deps.size > 0, "Size must be positive: " + this.deps.size); // prettier-ignore

    //prepare configuration

    this.dataSize = deps.dataSize ?? this.defaulDataSize;
    const byteSize = SharedPageHeap.getExpectedBytesize(this.deps.size, this.dataSize); // prettier-ignore

    //check

    //absolute minimum would be 4, because we use atomics.
    assert(Number.isInteger(this.dataSize / 8), "data size must be multiple of 8, was: " + this.dataSize); // prettier-ignore

    //data

    if (this.deps.sharedArrayBuffer) {
      assertEq(this.deps.sharedArrayBuffer.byteLength, byteSize , "The given SharedArrayBuffer has wrong size."); // prettier-ignore

      this.sharedArrayBuffer = this.deps.sharedArrayBuffer;
    } else {
      this.sharedArrayBuffer = new SharedArrayBuffer(byteSize);
    }

    //bit vector

    this.tree = new SharedCompactBitTree({
      maxSize: this.deps.size,
      dataSize: this.dataSize,
      byteSize,
      sharedArray: new Int32Array(this.sharedArrayBuffer),
      unpack: this.deps.unpack,
    });
  }

  /**
   *
   */
  public static getExpectedBytesize = (n: number, dataByteSize: number) =>
    SharedCompactBitTree.getExpectedBytesize(n, dataByteSize);

  /**
   *
   */
  get count() {
    return this.tree.count;
  }

  /**
   *
   */
  public pack = () => ({
    sharedArrayBuffer: this.sharedArrayBuffer,
    size: this.deps.size,
    dataSize: this.dataSize,
    unpack: true,
  });

  /**
   * Get a previously allocated memory.
   *
   * - This is used in other threads, to get the shared memory, dynamically.
   */
  public get = <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    assert(Number.isInteger(this.dataSize / TypedArray.BYTES_PER_ELEMENT));

    return new TypedArray(
      this.sharedArrayBuffer,
      this.tree.getDataIndex(ref),
      this.dataSize / TypedArray.BYTES_PER_ELEMENT
    );
  };

  /**
   * Allocate the given size of shared memory.
   *
   * - The memory isn't locked, so it can be retrieved in other threads.
   * - The memory is only protected against reuse for other allocations.
   * - All threads with the returned reference can get/deallocate the memory.
   *
   */
  public allocate = <T extends TypedArray>(
    TypedArray: TypedArrayContructor<T>,
    zeroFill = true
  ) => {
    const ref = this.tree.allocate();

    const array = this.get(ref, TypedArray);

    if (array instanceof BigInt64Array || array instanceof BigUint64Array) {
      zeroFill && array.fill(BigInt(0));
    } else {
      zeroFill && array.fill(0);
    }

    return { ref, array };
  };

  /**
   *
   */
  public deallocate = (ref: number) => {
    this.tree.deallocate(ref);
  };

  /**
   *
   */
  public toString = () => {
    return tos(new Int32Array(this.sharedArrayBuffer));
  };
}
