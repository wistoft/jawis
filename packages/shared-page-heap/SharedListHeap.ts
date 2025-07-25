import {
  TypedArray,
  TypedArrayContructor,
  assert,
  assertEq,
  err,
  makeTypedArray,
} from "^jab";
import { FixedSizeHeap, INT32_UNDEFINED } from "^shared-algs";

export type SharedListHeapDeps = {
  maxSize: number;
  dataSize: number;
  sharedArray: Int32Array;

  //internal: used for unpack. (default: false)
  initialized?: boolean;

  //for testing

  verifyAfterOperations: boolean;
};

const ALLOC_COUNT_OFFSET = 0; //number of allocated chunks.

const FREE_HEAD_OFFSET = ALLOC_COUNT_OFFSET + 1;

const STATIC_META_DATA_LENGTH = FREE_HEAD_OFFSET + 1;

//trouble, if not multiple of 8.
const STATIC_META_DATA_BYTES =
  Int32Array.BYTES_PER_ELEMENT * STATIC_META_DATA_LENGTH;

const NODE_ALLOCATED = 0x7ffffffe; //also in use: INT32_UNDEFINED

/**
 * - Fixed size doubly linked list
 * - Links are kept in the header section
 * - Pages contains only user data, so dataSize === pageSize
 * - Must initialize all memory itself, because this is the most basic data structure and the sharedArray could be reused.
 *
 * impl
 *  - Pages are 0-indexed
 *  - It's possible to determine if a page is allocated because NODE_ALLOCATED is stored in its `next slot`
 *
 * notes
 *  - Free list only need to be a singly linked list.
 *
 * memory layout
 *   meta data
 *     4 bytes alloc count
 *     4 bytes free list head
 *     repeated n times
 *       4 bytes ref to next page
 *     4 bytes padding (optional depending on n)
 *   n pages (sequentially in memory)
 *
 * page layout
 *   x bytes   data
 *
 * structure of reference (heighest bits first)
 *   32 bits   page index
 *
 */
export class SharedListHeap implements FixedSizeHeap {
  readonly dataSize: number; //size in bytes

  private META_DATA_BYTES: number;

  /**
   *
   */
  constructor(public deps: SharedListHeapDeps) {
    assert(this.deps.dataSize > 0, "Data size must be positive: " + this.deps.dataSize); // prettier-ignore
    assert(this.deps.maxSize > 0, "Max size must be positive: " + this.deps.maxSize); // prettier-ignore

    assert(Number.isInteger(this.deps.dataSize / 4), "data size must be multiple of 4, was: " + this.deps.dataSize); // prettier-ignore

    this.dataSize = deps.dataSize;

    //check byte size

    const byteSize = SharedListHeap.getExpectedByteSize(this.deps.maxSize, this.deps.dataSize); // prettier-ignore

    assertEq(this.deps.sharedArray.byteLength, byteSize , "The given sharedArray has wrong size."); // prettier-ignore

    //trouble, if not multiple of 8.

    const _maxSize = (this.deps.maxSize / 2) * 2; //rounded up, evenly.

    this.META_DATA_BYTES = STATIC_META_DATA_BYTES + _maxSize * 4;

    //state

    if (!deps.initialized) {
      this.deps.sharedArray[ALLOC_COUNT_OFFSET] = 0;
      this.deps.sharedArray[FREE_HEAD_OFFSET] = 0;

      //loop through all the pages and setup next links.

      for (let i = 0; i < this.deps.maxSize; i++) {
        const next = i === this.deps.maxSize - 1 ? INT32_UNDEFINED : i + 1;

        this.setNext(i, next);
      }
    }
  }

  /**
   *
   */
  public static getExpectedByteSize = (n: number, dataSize: number) =>
    STATIC_META_DATA_BYTES + (n / 2) * 2 * (dataSize + 4);

  /**
   * partial
   */
  public pack = () => {
    return {
      maxSize: this.deps.maxSize,
      dataSize: this.deps.dataSize,
      sharedArray: this.deps.sharedArray,
      verifyAfterOperations: this.deps.verifyAfterOperations,
      initialized: true,
    } satisfies Partial<SharedListHeapDeps>;
  };

  /**
   *
   */
  get count() {
    return this.deps.sharedArray[ALLOC_COUNT_OFFSET];
  }

  /**
   *
   */
  private set count(value: number) {
    this.deps.sharedArray[ALLOC_COUNT_OFFSET] = value;
  }

  /**
   *
   */
  public getPageByteOffset = (pageIndex: number) =>
    this.META_DATA_BYTES + pageIndex * this.deps.dataSize;

  /**
   *
   */
  get = <A extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<A>
  ) => {
    assert(Number.isInteger(this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT));

    assert(0 <= ref && ref < this.deps.maxSize, "Reference isn't valid: ", { ref }); // prettier-ignore

    if (this.getNext(ref) !== NODE_ALLOCATED) {
      err("Reference isn't valid: ", { ref, dataSize: this.deps.dataSize });
    }

    const arr = makeTypedArray(
      this.deps.sharedArray,
      TypedArray,
      this.getPageByteOffset(ref),
      this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT
    );

    return arr;
  };

  /**
   *
   */
  allocate = <A extends TypedArray>(
    TypedArray: TypedArrayContructor<A>,
    zeroFill?: boolean
  ) => {
    const ref = this._allocate();

    const array = this.get(ref, TypedArray);

    if (array instanceof BigInt64Array || array instanceof BigUint64Array) {
      zeroFill && array.fill(BigInt(0));
    } else {
      zeroFill && array.fill(0);
    }

    this.deps.verifyAfterOperations && this._invariant();

    return { ref, array };
  };

  /**
   * Get a free page from the free list.
   */
  private _allocate = () => {
    const freeHeadRef = this.deps.sharedArray[FREE_HEAD_OFFSET];

    if (freeHeadRef !== INT32_UNDEFINED) {
      this.deps.sharedArray[FREE_HEAD_OFFSET] = this.getNext(freeHeadRef);

      this.count++;

      //mark the node as allocated

      this.setNext(freeHeadRef, NODE_ALLOCATED);

      return freeHeadRef;
    } else {
      throw new Error("Out of memory");
    }
  };

  /**
   *
   * - The deallocated node becomes the new free head.
   *
   */
  deallocate = (ref: number) => {
    assert(0 <= ref && ref < this.deps.maxSize, "ref out of bounds: ", { ref });

    if (this.getNext(ref) !== NODE_ALLOCATED) {
      err("Reference isn't valid: ", { ref });
    }

    this.count--;

    this.pushFreeNode(ref);

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   *
   */
  private pushFreeNode = (pageIndex: number) => {
    // set free head as the next

    this.setNext(pageIndex, this.deps.sharedArray[FREE_HEAD_OFFSET]);

    // the node becomes the new free head.

    this.deps.sharedArray[FREE_HEAD_OFFSET] = pageIndex;
  };

  /**
   *
   */
  private getNext = (ref: number) => {
    assert(0 <= ref && ref < this.deps.maxSize, "ref out of bounds: ", { ref });

    return this.deps.sharedArray[STATIC_META_DATA_BYTES / 4 + ref];
  };

  /**
   *
   */
  private setNext = (ref: number, value: number) => {
    assert(0 <= ref && ref < this.deps.maxSize, "ref out of bounds: ", { ref });

    this.deps.sharedArray[STATIC_META_DATA_BYTES / 4 + ref] = value;
  };

  /**
   *
   */
  private _invariant = () => {
    let node = this.deps.sharedArray[FREE_HEAD_OFFSET];
    let freeCount = 0;
    const freeNodes: number[] = [];

    while (node !== INT32_UNDEFINED) {
      freeCount++;

      freeNodes.push(node);

      node = this.getNext(node);

      //safe breaker

      if (freeCount > this.deps.maxSize) {
        err("Impossible: free count to high", this.deps.sharedArray);
      }
    }

    assertEq(this.count + freeCount, this.deps.maxSize);

    //check allocated nodes

    for (let i = 0; i < this.deps.maxSize; i++) {
      if (freeNodes.includes(i)) {
        continue;
      }

      if (this.getNext(i) !== NODE_ALLOCATED) {
        err("Reference isn't valid: ", { ref: i });
      }
    }
  };

  /**
   *
   */
  toString = () => {
    throw new Error("not impl");
  };
}
