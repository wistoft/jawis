import {
  assert,
  def,
  err,
  FinallyFunc,
  tos,
  TypedArray,
  TypedArrayContructor,
} from "^jab";
import { assertEq } from "^jab/error";
import {
  LinkedListNode,
  SharedDoublyLinkedList,
} from "./SharedDoublyLinkedList";

import { DoublyLinkedListProv, FixedSizeHeap } from "./SharedUtil";
import { SharedValidityVector } from "./SharedValidityVector";

export type SharedChunkHeapDeps = {
  heap: FixedSizeHeap;
  dataSize: number;
  finally: FinallyFunc;
};

/**
 * A heap of the given chunk size. Created from another heap.
 *
 *  - This is very similar to `SharedCompactBitTree` and `SharedCompactBitTree`.
 *      But this is implemented on a heap, rather then directly on a shared array.
 *
 * impl invariants
 *  - There is at least one node.
 *  - All full nodes are before any free node.
 *  - Free head point at the last full or first free node.
 *
 * structure of reference (heighest bits first)
 *  20 bits   page ref
 *   4 bits   chunk version
 *   8 bits   chunk index
 */
export class SharedChunkHeap implements FixedSizeHeap {
  public count = 0;
  private list: DoublyLinkedListProv;
  private freeHead: LinkedListNode<Int32Array, Int32Array>;

  readonly dataSize: number; //size of chunks in bytes

  readonly CHUNKS_PER_NODE: number;
  readonly VALIDITY_VECTOR_BYTES: number;

  /**
   *
   */
  constructor(private deps: SharedChunkHeapDeps) {
    this.dataSize = deps.dataSize;

    assert(this.deps.dataSize > 0, "Data size must be positive: " + this.deps.dataSize); // prettier-ignore

    //conf

    this.CHUNKS_PER_NODE = SharedChunkHeap.getMaxChunksPerNode(
      SharedValidityVector.BLOCK_SIZE,
      SharedValidityVector.BYTE_OVERHEAD,
      this.deps.heap.dataSize - SharedDoublyLinkedList.HEADER_BYTES,
      this.deps.dataSize
    );

    assert(this.CHUNKS_PER_NODE > 1, "There must be at least two chunks per page, space for: ", this.CHUNKS_PER_NODE); // prettier-ignore

    this.VALIDITY_VECTOR_BYTES = SharedValidityVector.getExpectedBytesize(this.CHUNKS_PER_NODE); // prettier-ignore

    const availableDataSize = SharedDoublyLinkedList.getDataAvailable(
      this.deps.heap.dataSize,
      this.VALIDITY_VECTOR_BYTES
    );

    //allocate

    this.list = new SharedDoublyLinkedList({
      heap: this.deps.heap,
      nodeDataSize: this.VALIDITY_VECTOR_BYTES,
      dataSize: availableDataSize,
    });

    //first node

    this.freeHead = this.list.appendNew(Int32Array, Int32Array);
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

    //chunks allocateable given the amount of blocks.

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
    const { ref, array } = this.getFreeSubArray(TypedArray);

    if (array instanceof BigInt64Array || array instanceof BigUint64Array) {
      zeroFill && array.fill(BigInt(0));
    } else {
      zeroFill && array.fill(0);
    }

    this.count++;

    this._invariant();

    return { ref, array };
  };

  /**
   *
   */
  public deallocate = (ref: number) => {
    // console.log(this.freeHead.ref);
    // console.log(this.toString());

    this._deallocate(ref);

    // console.log(this.freeHead.ref);
    // console.log(this.toString());

    this.count--;

    this._invariant();
  };

  /**
   * todo: linked list doesn't deallocate. So must do it here.
   */
  private _deallocate = (ref: number) => {
    const { nodeRef, chunkIndex, version, node, bitVector } = this.decode(ref);

    const wasFull = bitVector.isFull();

    bitVector.invalidate(chunkIndex, version);

    if (wasFull) {
      assert(!bitVector.isEmpty());
      this.updateFreeHead(node);
      return;
    }

    if (!bitVector.isEmpty()) {
      return;
    }

    //update free head (if it points to the node that will be deleted)

    if (this.freeHead.ref === nodeRef) {
      const nextRef = this.list.nextRef(node);

      if (nextRef !== undefined) {
        // it has a next node, which must become the new root.

        this.freeHead = this.list.get(nextRef, Int32Array, Int32Array);
      } else {
        const prevRef = this.list.prevRef(node);

        if (prevRef !== undefined) {
          //there's no next node, and this node is deleted. The previous must become the
          // free head pointer, even tough it is full (by definition).

          this.freeHead = this.list.get(prevRef, Int32Array, Int32Array);
        }
      }
    }

    //delete node (except if it's the last node)

    if (this.list.count > 1) {
      this.list.delete(node);
    }
  };

  /**
   * Given a node, that has become free.
   *
   *  - The node is moved to the right, until the free pointer is reached.
   *    - If the free head is full, the node is placed after. Otherwise before.
   *  - The node becomes the new free head.
   *    - It will be sorted correctly, because it has removed only one element, so it's a maximal element.
   */
  private updateFreeHead = (node: LinkedListNode<Int32Array, Int32Array>) => {
    const nextRef = this.list.nextRef(node);

    //it's the node at the end of the list

    if (nextRef === undefined) {
      assert(this.freeHead.ref === node.ref);
      return;
    }

    const firstBitVector = this.getBitVector(this.freeHead);

    const freeHeadIsFull = firstBitVector.isFull();

    //it's already the free head.

    if (this.freeHead.ref === node.ref) {
      return;
    }

    //add node before/after of free head.

    const beforeFreeNode = !freeHeadIsFull;

    this.list.move(node, this.freeHead, beforeFreeNode);

    //it's the new free head

    this.freeHead = node;
  };

  /**
   *
   */
  private getFreeSubArray = <T extends TypedArray>(
    TypedArray: TypedArrayContructor<T>
  ) => {
    let chunk = this.getBitVector(this.freeHead).tryGet();

    //make new free head, if no index'es left.

    if (chunk === undefined) {
      const next = this.list.nextRef(this.freeHead);

      if (next !== undefined) {
        this.freeHead = this.list.get(next, Int32Array, Int32Array);
      } else {
        this.freeHead = this.list.insertNew(
          this.freeHead,
          Int32Array,
          Int32Array
        );
      }

      chunk = this.getBitVector(this.freeHead).tryGet();

      if (chunk === undefined) {
        throw new Error("Impossible");
      }
    }

    // return

    return {
      ref: this.encode(this.freeHead.ref, chunk.index, chunk.version),
      array: this.getSubArray(chunk.index, this.freeHead, TypedArray),
    };
  };

  /**
   *
   */
  private getSubArray = <T extends TypedArray>(
    chunkIndex: number,
    node: LinkedListNode<Int32Array, Int32Array>,
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
  private getBitVector = (node: LinkedListNode<Int32Array, Int32Array>) => {
    assert(this.VALIDITY_VECTOR_BYTES === node.nodeData.byteLength);

    return new SharedValidityVector({
      size: this.CHUNKS_PER_NODE,
      sharedArray: node.nodeData,
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
      throw new Error("Version too heigh");
    }

    if (this.freeHead.ref > 2e20) {
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

    const node = this.list.get(nodeRef, Int32Array, Int32Array);

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

    return { nodeRef, chunkIndex, version, node, bitVector };
  };

  /**
   *
   */
  private _invariant = () => {
    assert(this.freeHead !== undefined);

    //start

    let prev: LinkedListNode<Int32Array, Int32Array> | undefined;
    let node = def(this.list.getHead(Int32Array, Int32Array));
    let seenFreeNode = false;
    let actualCount = 0;

    while (true) {
      const bitVector = this.getBitVector(node);

      //check free head is placed where we transition to non-full nodes.

      const currentIsFreeNode = !bitVector.isFull();

      if (currentIsFreeNode && !seenFreeNode) {
        //must be on this or previous node.

        assert(
          this.freeHead.ref === node.ref || this.freeHead.ref === prev?.ref,
          "Free head in wrong position"
        );

        //done

        seenFreeNode = true;
      }

      //nodes after free head must be free

      if (seenFreeNode) {
        assert(currentIsFreeNode);
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
        assertEq(actualCount, this.count);

        if (!seenFreeNode) {
          assertEq(this.freeHead.ref, node.ref, "Free head must be on last node."); // prettier-ignore
        }

        break;
      }

      //next link

      const nextNode = this.list.get(nextRef, Int32Array, Int32Array);

      //prepare for next iteration

      prev = node;
      node = nextNode;
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
        const chunk = this.getSubArray(index, node, Int32Array);
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
}
