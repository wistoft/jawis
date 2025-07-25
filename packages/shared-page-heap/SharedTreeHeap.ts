import {
  TypedArray,
  TypedArrayContructor,
  assert,
  assertEq,
  err,
  makeTypedArray,
  tos,
} from "^jab";
import { FixedSizeHeap, SharedValidityVector } from "^shared-algs";

import { _getRoot, _leftNode, _rightNode } from "./internal";

export type SharedTreeHeapDeps = {
  maxSize: number;
  dataSize: number;
  sharedArray: Int32Array;
  useChunkVersion: boolean;

  //internal: used for unpack. (default: false)
  initialized?: boolean;
};

const CHUNK_COUNT_OFFSET = 0; //number of allocated chunks.

const PAGE_COUNT_OFFSET = CHUNK_COUNT_OFFSET + 1; //the length of the tree.

const META_DATA_LENGTH = PAGE_COUNT_OFFSET + 1;

//trouble, if not multiple of 8.
const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 * A tree is laid out sequentially in memory.
 *
 * - A left Left-compact tree.
 *    - With a fixed left endpoint, and a dynamic right endpoint for adding/removing pages.
 *    - Pages can't be inserted/deleted in the middle of the tree.
 * - Each page contains valid bits, to indicate which data chunks are currently in use.
 * - The user can interpret the data in any way, the only restrictions are:
 *    - Allocate finds an invalid chunk, makes i valid, and returns it.
 *    - Deallocated throws if given chunk isn't valid.
 * - Must initialize all memory itself, because this is the most basic data structure and the sharedArray could be reused.
 *
 * Complexity
 *  - Get is contant time, and requires no memory access.
 *    - maybe we could accept a single memory access, in order to support relocation and garbage collection.
 *      Maybe a better solution would be a way to signal to users, that a re-allocation would be desirable.
 *  - Allocation and deallocation is log(n)
 *
 * notes
 *  - Maintains a tree with a full subtree on the left hand-side.
 *    - More precisely: All subtrees reachable by at least one left edge are perfect.
 *  - Pages are zero-indexed.
 *  - Pages are are always added/removed at the right end.
 *  - Edges are virtual. They can be determined from the bit-representation of page-index.
 *  - Similar implementation/purpose as SharedChunkHeap
 *    - maybe that implementation is better, because the linked list is constant time in (de)allocation.
 *      The only difference is, that this implementation must keep a free list instead of deallocation
 *      in the parent heap.
 *
 * memory layout
 *  - meta data
 *  - pages (sequentially in memory)
 *
 * page layout
 *   2  uint32   free-bit-boolean. If left/right subtree has any valid bits it's 1, otherwise 0.
 *   64 bits     valid-bits
 *   n  bytes    space for chunks. For external use.
 *
 * structure of reference (heighest bits first)
 *   27 bits   page index
 *   1  bit    chunk index
 *   4  bits   chunk integrity version
 *
 * todo
 *  - What is the purpose of having chunks? Maybe so the validity bytes can be fully used. They have to be 8 bytes.
 *    So alignment isn't problem. It would also be better to have free-bit-booleans co-located in memory rows, so the
 *    the search for pages makes the most use for memory fetches.
 *  - pagecount isn't decreased. But is the heighest unused pages could be removed, if user's want to reclaim place.
 *  - Shrink pagecount isn't implemented. Could remove pages from right, when they becomes empty.
 */
export class SharedTreeHeap implements FixedSizeHeap {
  private maxPages: number;
  private pageByteSize: number;

  private static FREE_BIT_BYTE_SIZE = 8;
  private static VALIDITY_VECTOR_BYTE_SIZE = 8;
  private static VALIDITY_VECTOR_BYTE_OFFSET = 8;

  private static PAGE_HEADER_BYTE_SIZE = SharedTreeHeap.FREE_BIT_BYTE_SIZE + SharedTreeHeap.VALIDITY_VECTOR_BYTE_SIZE; // prettier-ignore
  private static DATA_OVERHEAD = 8;
  private static DATA_COUNT_PER_PAGE = 2;

  /**
   *
   */
  constructor(public deps: SharedTreeHeapDeps) {
    assert(deps.dataSize > 0, "Datasize must be positive: " + deps.dataSize); // prettier-ignore
    assert(this.deps.maxSize > 0, "Max size must be positive: " + this.deps.maxSize); // prettier-ignore

    assert(Number.isInteger(this.deps.dataSize / 4), "data size must be multiple of 4, was: " + this.deps.dataSize); // prettier-ignore

    //check byte size

    const byteSize = SharedTreeHeap.getExpectedByteSize(this.deps.maxSize, this.deps.dataSize); // prettier-ignore

    assertEq(this.deps.sharedArray.byteLength, byteSize , "The given sharedArray has wrong size."); // prettier-ignore

    //derived

    this.maxPages = Math.ceil(this.deps.maxSize / SharedTreeHeap.DATA_COUNT_PER_PAGE); // prettier-ignore

    this.pageByteSize =
      SharedTreeHeap.PAGE_HEADER_BYTE_SIZE +
      SharedTreeHeap.DATA_COUNT_PER_PAGE * this.deps.dataSize;

    //state

    if (!deps.initialized) {
      this.deps.sharedArray[CHUNK_COUNT_OFFSET] = 0;
      this.deps.sharedArray[PAGE_COUNT_OFFSET] = 1;
    }
  }

  /**
   *
   */
  public pack = (): SharedTreeHeapDeps => ({
    maxSize: this.deps.maxSize,
    dataSize: this.deps.dataSize,
    sharedArray: this.deps.sharedArray,
    useChunkVersion: this.deps.useChunkVersion,
    initialized: true,
  });

  /**
   *
   */
  public static getExpectedByteSize = (n: number, dataSize: number) => {
    const headerCount = Math.ceil(
      (n * SharedTreeHeap.DATA_OVERHEAD) / SharedTreeHeap.PAGE_HEADER_BYTE_SIZE
    );

    const headerBytes = headerCount * SharedTreeHeap.PAGE_HEADER_BYTE_SIZE;

    return META_DATA_BYTES + headerBytes + n * dataSize;
  };

  /**
   *
   */
  get dataSize() {
    return this.deps.dataSize;
  }

  /**
   *
   */
  get count() {
    return this.deps.sharedArray[CHUNK_COUNT_OFFSET];
  }

  /**
   *
   */
  private getChuckByteOffset = (ref: number) => {
    const { pageIndex, chunkIndex } = this.decode(ref);

    const pageByteOffset = META_DATA_BYTES + pageIndex * this.pageByteSize + SharedTreeHeap.PAGE_HEADER_BYTE_SIZE; // prettier-ignore

    return pageByteOffset + chunkIndex * this.deps.dataSize;
  };

  /**
   * Get previously allocated memory.
   *
   * - This is used in other threads, to get the shared memory, dynamically.
   */
  public get = <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    assert(Number.isInteger(this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT));

    return makeTypedArray(
      this.deps.sharedArray,
      TypedArray,
      this.getChuckByteOffset(ref),
      this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT
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
    const ref = this.allocate2();

    const array = this.get(ref, TypedArray);

    if (array instanceof BigInt64Array || array instanceof BigUint64Array) {
      zeroFill && array.fill(BigInt(0));
    } else {
      zeroFill && array.fill(0);
    }

    return { ref, array };
  };

  /**
   * udgår
   */
  private allocate2 = () => {
    const index = this.tryAllocate();

    if (index === undefined) {
      throw new Error("Not enough space, max: " + this.deps.maxSize); // prettier-ignore
    }

    return index;
  };

  /**
   *
   *  - Increases the data structure if it's needed. And if the allotted space allows it.
   *
   * impl
   *  - The left subpage of the added page will always be full. Either it's a leaf page. Or it's
   *      a inner page and the left sub page is filled, because we only add pages, when we run out of space.
   *  - Note: The inserted page is the right most in the tree, because it's the largest page. Hence it's reachable
   *      via only right edges. Otherwise a ancestor would be to the right it.
   *  - The pages that will have free-bits below them after insertion, are the pages from the root to the
   *      inserted page. I.e. the pages reachable from the root by following right edges.
   *  - Note the inserted page shouldn't have a free-bits set true for right subtree, but the `_tryGet` will have same
   *      semantics. It will just try to recurse and set free-bits to false.
   */
  public tryAllocate = () => {
    const index = this._tryAllocate(_getRoot(this.deps.sharedArray[PAGE_COUNT_OFFSET])); // prettier-ignore

    if (index !== undefined) {
      return index;
    }

    //it's was out of space

    if (this.deps.sharedArray[PAGE_COUNT_OFFSET] < this.maxPages) {
      // we can increase pages.

      this.deps.sharedArray[PAGE_COUNT_OFFSET]++;
      const cachedPageCount = this.deps.sharedArray[PAGE_COUNT_OFFSET];

      //set free-bit-boolean from root-page (possibly new) to all transitive right pages.

      let pageIndex: number | undefined = _getRoot(cachedPageCount);

      do {
        const freeBitArray = this.getFreeBitArray(pageIndex);

        freeBitArray[1] = 1;
      } while ((pageIndex = _rightNode(pageIndex, cachedPageCount)));

      // now there should be something

      const newIndex = this._tryAllocate(_getRoot(cachedPageCount));

      assert(newIndex !== undefined, "Impossible");

      return newIndex;
    }

    //out of space, and can't expand.
  };

  /**
   * in-order dfs traversal.
   *  - Finds the left-most page with free space.
   */
  private _tryAllocate = (pageIndex: number): number | undefined => {
    if (pageIndex + 1 > this.deps.sharedArray[PAGE_COUNT_OFFSET]) {
      throw new Error("Impossible");
    }

    const freeBitArray = this.getFreeBitArray(pageIndex);

    //left pages

    if (freeBitArray[0] === 1) {
      const left = _leftNode(pageIndex);

      if (left !== undefined) {
        const index = this._tryAllocate(left);

        if (index !== undefined) {
          return index;
        }
      }

      //left sub tree is filled now.

      freeBitArray[0] = 0;

      //continue to search in own and right subpages.
    }

    // own page

    const chunk = this.getValidityVector(pageIndex).tryGet();

    if (chunk !== undefined) {
      const { index, ref } = this.encode(pageIndex, chunk.index, chunk.version);

      if (index >= this.deps.maxSize) {
        //index was found in this page, but the size limit is reach within this exact page.
        return;
      } else {
        this.deps.sharedArray[CHUNK_COUNT_OFFSET]++;

        //found in own page
        return ref;
      }
    }

    //right pages

    if (freeBitArray[1] === 1) {
      const right = _rightNode(
        pageIndex,
        this.deps.sharedArray[PAGE_COUNT_OFFSET]
      );

      if (right !== undefined) {
        return this._tryAllocate(right);
      }

      //right sub tree is filled now.

      freeBitArray[1] = 0;
    }

    //nothing found

    return;
  };

  /**
   *
   */
  public deallocate = (ref: number) => {
    const { pageIndex, chunkIndex, version } = this.decode(ref);

    this.deps.sharedArray[CHUNK_COUNT_OFFSET]--;

    this._deallocate(
      ref,
      pageIndex,
      chunkIndex,
      version,
      _getRoot(this.deps.sharedArray[PAGE_COUNT_OFFSET])
    );
  };

  /**
   * in-order dfs traversal.
   *  - Finds the page and invalidates the chunk. (it could be done in constant time)
   *  - Sets free-bit-booleans. (which require a log(n) traversal)
   *
   * impl
   *  - sets the page 'statistics' on the way up. Because there are user input, a throw
   *    could corrupt the tree.
   *  - Might actually not be a semantic problem, because `tryGet` will just perform the search,
   *    and then set the page 'statistics' correctly again.
   *
   * todo
   *  - extract, so this only does searchPage.
   */
  private _deallocate = (
    ref: number,
    pageIndex: number,
    chunkIndex: number,
    version: number,
    curPageIndex?: number
  ) => {
    if (curPageIndex === undefined) {
      throw new Error("Reference out of range: " + ref);
    }

    const freeBitArray = this.getFreeBitArray(curPageIndex);

    //left

    if (pageIndex < curPageIndex) {
      this._deallocate(
        ref,
        pageIndex,
        chunkIndex,
        version,
        _leftNode(curPageIndex)
      );

      freeBitArray[0] = 1;

      return;
    }

    //own

    if (pageIndex < curPageIndex + 1) {
      this.getValidityVector(curPageIndex).invalidate(chunkIndex, version);

      return;
    }

    //right

    this._deallocate(
      ref,
      pageIndex,
      chunkIndex,
      version,
      _rightNode(curPageIndex, this.deps.sharedArray[PAGE_COUNT_OFFSET])
    );

    freeBitArray[1] = 1;
  };

  /**
   * SharedChunkHeap.encode seems better. And can we extract to ValidityVector?
   */
  private encode = (
    pageIndex: number,
    chunkIndex: number,
    _version: number
  ) => {
    if (chunkIndex > 1) {
      throw new Error("not impl");
    }

    const version = this.deps.useChunkVersion ? _version : 0;

    if (version > 15) {
      throw new Error("Version too high");
    }

    const baseIndex = pageIndex * SharedTreeHeap.DATA_COUNT_PER_PAGE;

    const index = baseIndex + chunkIndex;

    return { index, ref: version + (index << 4) };
  };

  /**
   * SharedChunkHeap.decode seems better. And can we extract to ValidityVector?
   */
  private decode = (ref: number) => {
    const version = this.deps.useChunkVersion ? ref & 0xf : 1;

    assert(version !== 0, "Reference isn't valid: ", { ref, version });

    const index = ref >>> 4;

    const pageIndex = Math.floor( index / SharedTreeHeap.DATA_COUNT_PER_PAGE ); // prettier-ignore

    if (
      pageIndex < 0 ||
      pageIndex >= this.deps.sharedArray[PAGE_COUNT_OFFSET]
    ) {
      err("Reference isn't valid: ", { ref, pageIndex });
    }

    const baseIndex = pageIndex * SharedTreeHeap.DATA_COUNT_PER_PAGE;

    const chunkIndex = index - baseIndex;

    const bitVector = this.getValidityVector(pageIndex);

    assert(bitVector.isValid(chunkIndex, version), "Reference isn't valid: ", {
      ref,
      index,
      pageIndex,
      chunkIndex,
      version,
    });

    return { pageIndex, chunkIndex, version };
  };

  /**
   *
   */
  private getFreeBitArray = (pageIndex: number) => {
    const freeBitOffset =
      META_DATA_BYTES / 4 + (pageIndex * this.pageByteSize) / 4;

    const freeBitArray = this.deps.sharedArray.subarray(freeBitOffset, freeBitOffset + SharedTreeHeap.FREE_BIT_BYTE_SIZE / 4); // prettier-ignore

    assert(freeBitArray.length === 2, undefined, {  freeBitArray, pageIndex, sharedArray: this.deps.sharedArray, freeBitOffset, }); // prettier-ignore

    return freeBitArray;
  };

  /**
   *
   */
  private getValidityVector = (pageIndex: number) => {
    const freeBitOffset = META_DATA_BYTES / 4 + (pageIndex * this.pageByteSize) / 4; // prettier-ignore
    const validityVectorOffset = freeBitOffset + SharedTreeHeap.VALIDITY_VECTOR_BYTE_OFFSET / 4; // prettier-ignore

    const sharedArray = this.deps.sharedArray.subarray(validityVectorOffset, validityVectorOffset + SharedTreeHeap.VALIDITY_VECTOR_BYTE_SIZE / 4); // prettier-ignore

    assert(sharedArray.length === 2, undefined, { sharedArray });

    return new SharedValidityVector({
      size: SharedTreeHeap.VALIDITY_VECTOR_BYTE_SIZE / 4,
      sharedArray,
      useChunkVersion: this.deps.useChunkVersion,
    });
  };

  /**
   *
   */
  public toString = () => tos(this.deps.sharedArray);
}
