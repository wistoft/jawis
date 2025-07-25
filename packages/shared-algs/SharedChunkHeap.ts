import {
  assert,
  def,
  err,
  tos,
  TypedArray,
  TypedArrayContructor,
  assertEq,
} from "^jab";

import {
  FixedSizeHeap,
  SharedValidityVector,
  NodeWithMetaData,
  SharedDoublyLinkedList,
  HeapFactory,
  makeMakeNode,
} from "./internal";

export type SharedChunkHeapDeps = {
  heapFactory: HeapFactory;
  pageSize: number;
  dataSize: number;

  //for testing

  verifyAfterOperations: boolean;
};

type InternalNode = NodeWithMetaData<Uint32Array, Uint32Array>;

const CHUNK_COUNT_OFFSET = 0; //number of allocated chunks.

const FREE_POINTER_OFFSET = CHUNK_COUNT_OFFSET + 1;

const META_DATA_LENGTH = FREE_POINTER_OFFSET + 1;

/**
 * A heap of the given chunk size. Created from another heap.
 *
 *  - A chunk ref includes a random version, which is used to detect invalid references.
 *  - This heap allocates pages on the parent heap, and keeps them in a linked list.
 *    - Operations are constant time. Plus the time used in parent heap.
 *    - But parent pages are only deallocated when they are completely empty. Hence worst
 *      case space use is one parent page per child page.
 *
 * notes
 *  - Free seems to be synonymous with non-full.
 *  - Similar implementation/purpose as SharedLeftCompactTree
 *
 * impl invariants
 *  - There is at least one node.
 *  - All full nodes are before any non-full nodes in the list.
 *    - Non-full nodes are not in sorted order.
 *  - Free pointer points at the last full or first non-full node.
 *  - If the free pointer is full, then it's the last node in the list.
 *    - not needed for anything, though.
 *  - There's no empty nodes, except if the heap is fully empty.
 *
 * page layout
 *  x bytes   chunks
 *  y bytes   validity vector
 *
 * structure of reference (heighest bits first)
 *  20 bits   page ref
 *   4 bits   chunk integrity version
 *   8 bits   chunk index
 *
 * todo
 *  - count and freePointer should be in shared array
 *  - pack function.
 */
export class SharedChunkHeap implements FixedSizeHeap {
  public count = 0;
  private list: SharedDoublyLinkedList<InternalNode>;
  private freePointer: InternalNode;

  readonly dataSize: number; //size of chunks in bytes

  readonly CHUNKS_PER_NODE: number;
  readonly VALIDITY_VECTOR_BYTES: number;

  /**
   *
   */
  constructor(private deps: SharedChunkHeapDeps) {
    assert(this.deps.dataSize > 0, "Data size must be positive: " + this.deps.dataSize); // prettier-ignore

    this.dataSize = deps.dataSize;

    //conf

    this.CHUNKS_PER_NODE = SharedChunkHeap.getMaxChunksPerNode(
      SharedValidityVector.BLOCK_SIZE,
      SharedValidityVector.BYTE_OVERHEAD,
      this.deps.pageSize - SharedDoublyLinkedList.HEADER_BYTES,
      this.deps.dataSize
    );

    assert(this.CHUNKS_PER_NODE > 1, "There must be at least two chunks per page, space for: ", this.CHUNKS_PER_NODE); // prettier-ignore

    this.VALIDITY_VECTOR_BYTES = SharedValidityVector.getExpectedByteSize(this.CHUNKS_PER_NODE); // prettier-ignore

    const metaDataSize = this.VALIDITY_VECTOR_BYTES;

    const availableDataSize =
      SharedDoublyLinkedList.getDataAvailable(this.deps.pageSize) -
      metaDataSize;

    //node type

    const makeNode = makeMakeNode({
      metaDataSize,
      dataSize: availableDataSize,
      NodeTypedArray: Uint32Array,
      TypedArray: Uint32Array,
    });

    //allocate

    this.list = new SharedDoublyLinkedList({
      heapFactory: this.deps.heapFactory,
      dataSize: availableDataSize + metaDataSize,
      verifyAfterOperations: deps.verifyAfterOperations,
      makeNode,
    });

    //first node

    this.freePointer = this.list.appendNew();
  }

  /**
   *
   */
  public static getMaxChunksPerNode = (
    blockSize: number,
    overhead: number,
    available: number,
    dataSize: number
  ) => {
    //the maximal amount of useful blocks

    const a = (available - blockSize) / (blockSize * (dataSize + overhead));

    const blockCount = Math.floor(a + 1);

    //chunks allocatable given the amount of blocks.

    const maxChunks1 = blockCount * blockSize;

    //amount of chunks there is space for storing.

    const maxChunks2 = Math.floor(
      (available - maxChunks1 * overhead) / dataSize
    );

    const maxChunks = Math.min(maxChunks2, maxChunks1);

    //check

    const usedSpace =
      Math.ceil(maxChunks / blockSize) * overhead * blockSize +
      maxChunks * dataSize;

    if (available < usedSpace) {
      err("fail", {
        available,
        dataSize,
        blockCount,
        maxChunks,
        maxChunks1,
        maxChunks2,
      });
    }

    return maxChunks;
  };

  public pack = () => {
    throw new Error("Pack not impl");
  };

  /**
   * Get a previously allocated memory.
   *
   */
  public get = <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    const { node, chunkIndex } = this.decode(ref);

    return this.getSubArray(chunkIndex, node, TypedArray);
  };

  /**
   *
   */
  public allocate = <T extends TypedArray>(
    TypedArray: TypedArrayContructor<T>,
    zeroFill = true
  ) => {
    const { ref, array } = this.getNonFullSubArray(TypedArray);

    if (array instanceof BigInt64Array || array instanceof BigUint64Array) {
      zeroFill && array.fill(BigInt(0));
    } else {
      zeroFill && array.fill(0);
    }

    this.count++;

    this.deps.verifyAfterOperations && this._invariant();

    return { ref, array };
  };

  /**
   *
   */
  public deallocate = (ref: number) => {
    this._deallocate(ref);

    this.count--;

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   * todo: linked list doesn't deallocate. So must do it here.
   */
  private _deallocate = (ref: number) => {
    const { chunkIndex, version, node, bitVector } = this.decode(ref);

    const wasFull = bitVector.isFull();

    bitVector.invalidate(chunkIndex, version);

    if (wasFull) {
      assert(!bitVector.isEmpty());
      this.onNodeBecomesNonFull(node);
      return;
    }

    if (bitVector.isEmpty()) {
      this.onNodeBecomesEmpty(node);
    }
  };

  /**
   * Given a node, that has become empty.
   *
   */
  private onNodeBecomesEmpty = (node: InternalNode) => {
    //update free pointer (if it points to the node that will be deleted)

    if (this.freePointer.ref === node.ref) {
      const nextRef = this.list.nextRef(node);

      if (nextRef !== undefined) {
        // it has a next node, which must become the new root.

        this.freePointer = this.list.get(nextRef);
      } else {
        const prevRef = this.list.prevRef(node);

        if (prevRef !== undefined) {
          //there's no next node, and this node is deleted. The previous must become the
          // free pointer, even tough it is full (by definition).

          this.freePointer = this.list.get(prevRef);
        }
      }
    }

    //delete node (except if it's the last node)

    if (this.list.count > 1) {
      this.list.delete(node);
    }
  };

  /**
   * Given a node, that has become non-full.
   *
   *  - The node is moved to the free pointer. If the free pointer is full,
   *    the node is placed after. Otherwise before.
   *  - The node becomes the new free pointer. It will be sorted correctly,
   *    because it has removed only one element, so it's a maximal element.
   */
  private onNodeBecomesNonFull = (node: InternalNode) => {
    const nextRef = this.list.nextRef(node);

    //it's the node at the end of the list (also covered by case below, so uneeded)

    if (nextRef === undefined) {
      assert(this.freePointer.ref === node.ref);
      return;
    }

    //it's already the free pointer.

    if (this.freePointer.ref === node.ref) {
      return;
    }

    //add node before/after free pointer.

    const freeBitVector = this.getBitVector(this.freePointer);

    const beforeFreeNode = !freeBitVector.isFull();

    this.list.move(node, this.freePointer, beforeFreeNode);

    //it's the new free pointer

    this.freePointer = node;
  };

  /**
   *
   */
  private getNonFullSubArray = <T extends TypedArray>(
    TypedArray: TypedArrayContructor<T>
  ) => {
    let chunk = this.getBitVector(this.freePointer).tryGet();

    //make new free pointer, if there's no index'es left.

    if (chunk === undefined) {
      const next = this.list.nextRef(this.freePointer);

      if (next !== undefined) {
        this.freePointer = this.list.get(next);
      } else {
        this.freePointer = this.list.insertNew(this.freePointer);
      }

      chunk = this.getBitVector(this.freePointer).tryGet();

      if (chunk === undefined) {
        throw new Error("Impossible");
      }
    }

    // return

    return {
      ref: this.encode(this.freePointer.ref, chunk.index, chunk.version),
      array: this.getSubArray(chunk.index, this.freePointer, TypedArray),
    };
  };

  /**
   *
   */
  private getSubArray = <T extends TypedArray>(
    chunkIndex: number,
    node: InternalNode,
    TypedArray: TypedArrayContructor<T>
  ) => {
    const offset = chunkIndex * this.dataSize;

    assert(
      Number.isInteger(this.dataSize / TypedArray.BYTES_PER_ELEMENT),
      "TypedArray must divide data size: ",
      {
        dataSize: this.dataSize,
        TypedArray,
        TypedArraySize: TypedArray.BYTES_PER_ELEMENT + " bytes",
      }
    );

    return new TypedArray(
      node.data.buffer,
      node.data.byteOffset + offset,
      this.dataSize / TypedArray.BYTES_PER_ELEMENT
    );
  };

  /**
   *
   */
  private getBitVector = (node: InternalNode) => {
    assert(this.VALIDITY_VECTOR_BYTES === node.metaData.byteLength);

    return new SharedValidityVector({
      size: this.CHUNKS_PER_NODE,
      sharedArray: node.metaData,
      useChunkVersion: true,
    });
  };

  /**
   *
   */
  private encode = (nodeRef: number, chunkIndex: number, version: number) => {
    if (chunkIndex > 255) {
      throw new Error("not impl");
    }

    if (version > 15) {
      throw new Error("Version too high");
    }

    if (nodeRef > 2e20) {
      throw new Error("Node ref is too high to store.");
    }

    return chunkIndex + (version << 8) + (nodeRef << 12);
  };

  /**
   *
   */
  private decode = (ref: number) => {
    const chunkIndex = ref & 0xff;
    const version = (ref & 0x00000f00) >> 8;
    const nodeRef = (ref & 0xfffff000) >> 12;

    const node = this.list.get(nodeRef);

    const bitVector = this.getBitVector(node);

    assert(
      bitVector.isValid(chunkIndex, version),
      "chunk index isn't valid: ",
      {
        ref,
        nodeRef,
        chunkIndex,
        version,
      }
    );

    return { chunkIndex, version, node, bitVector };
  };

  /**
   *
   */
  private _invariant = () => {
    assert(this.freePointer !== undefined);

    //start

    let prev: InternalNode | undefined;
    let node = def(this.list.getHead());
    let hasSeenNonFullNode = false;
    let actualCount = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const bitVector = this.getBitVector(node);

      //check free pointer is placed where we transition to non-full nodes.

      const currentIsNonFull = !bitVector.isFull();

      if (currentIsNonFull && !hasSeenNonFullNode) {
        //must be on this or previous node.

        assert(
          this.freePointer.ref === node.ref ||
            this.freePointer.ref === prev?.ref,
          "Free pointer in wrong position"
        );

        //done

        hasSeenNonFullNode = true;
      }

      //nodes after free pointer must be non-full

      if (hasSeenNonFullNode) {
        assert(currentIsNonFull);
      }

      //check node isn't empty

      const nextRef = this.list.nextRef(node);

      if (prev !== undefined || nextRef !== undefined) {
        //there's more than one node.
        assert(!bitVector.isEmpty());
      }

      //count the chunks

      actualCount += bitVector.getCount();

      //end of line

      if (nextRef === undefined) {
        break;
      }

      //next link

      const nextNode = this.list.get(nextRef);

      //prepare for next iteration

      prev = node;
      node = nextNode;
    }

    //final checks

    assertEq(actualCount, this.count);

    if (!hasSeenNonFullNode) {
      assertEq(this.freePointer.ref, node.ref, "Free pointer must be on last node, when no non-full nodes"); // prettier-ignore
    }
  };

  /**
   *
   */
  public toString = (includeRef = true) => {
    const res: any = {};
    let i = 0;

    for (const node of this.list) {
      const bitVector = this.getBitVector(node);

      for (const { index, version } of bitVector) {
        const chunk = this.getSubArray(index, node, Uint32Array);
        const ref = includeRef ? this.encode(node.ref, index, version) : i++;
        res[ref] = tos(chunk) + "\n";
      }
    }

    if (this.count === 0) {
      return "SharedChunkHeap (0)";
    } else {
      return "SharedChunkHeap (" + this.count + ")\n" + tos(res);
    }
  };

  /**
   * Is the good enough?
   *  - maybe it would be better to ensure it uses no space, when empty. But that would not
   *    be possible, because threads need a shared value, even to determine that.
   */
  public dispose = () => {
    assert(this.count === 0, "Can only dispose when empty.");
    this.list.delete(this.freePointer);
    this.list.dispose();
  };
}
