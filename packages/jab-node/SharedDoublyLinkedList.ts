import {
  assert,
  assertEq,
  err,
  makeTypedArray,
  tos,
  TypedArray,
  TypedArrayContructor,
} from "^jab";
import {
  DoublyLinkedListProv,
  FixedSizeHeap,
  UINT32_UNDEFINED,
} from "./SharedUtil";

export type SharedDoublyLinkedListDeps = {
  heap: FixedSizeHeap;
  nodeDataSize: number; //in bytes
  dataSize: number;
};

/**
 *
 */
export type LinkedListNode<T extends TypedArray, U extends TypedArray> = {
  ref: number;
  nodeData: T;
  data: U;
};

/**
 *
 */
type InternalNode = {
  ref: number;
  raw: Int32Array;
};

/**
 * A heap, that is structured as a doubly linked list.
 *
 *  - There is support for two kinds of data, called: 'node data' and 'data'.
 *    - The idea is: this structure is used as a base structure to implement other structures. Which usually
 *        needs its own data (i.e. node data), will it stores data for its user (i.e. ordinary data).
 *    - Node data is placed at the end of the node, so it will not interfere with the alignment of the ordinary data.
 *
 * impl
 *  - This has internal data called 'header', which is next/prev links.
 *  - Node data and header is placed at the end of the page.
 *  - Data is on the same page as the node data and header.
 */
export class SharedDoublyLinkedList implements DoublyLinkedListProv {
  public rootRef?: number;
  public count = 0;

  private PREVIOUS_OFFSET: number; //depends on page size.
  private NEXT_OFFSET: number;

  private DATA_BYTE_OFFSET: number;
  private NODE_DATA_BYTE_OFFSET: number;

  public static HEADER_BYTES = 8;

  /**
   *
   */
  constructor(public deps: SharedDoublyLinkedListDeps) {
    assert(this.deps.nodeDataSize >= 0, undefined, "Node data size must be positive: " + this.deps.nodeDataSize); // prettier-ignore
    assert(this.deps.dataSize >= 0, undefined, "Data size must be positive: " + this.deps.dataSize); // prettier-ignore

    if (
      deps.heap.dataSize <
      SharedDoublyLinkedList.HEADER_BYTES +
        this.deps.nodeDataSize +
        this.deps.dataSize
    ) {
      err("Heap page is not large enough.", {
        pageSize: deps.heap.dataSize,
        nodeDataSize: this.deps.nodeDataSize,
        dataSize: this.deps.dataSize,
        LinkedListOverhead: SharedDoublyLinkedList.HEADER_BYTES,
      });
    }

    //position links at the end of the page

    const rawNodeLength = deps.heap.dataSize / Int32Array.BYTES_PER_ELEMENT;

    this.PREVIOUS_OFFSET = rawNodeLength - 2;
    this.NEXT_OFFSET = rawNodeLength - 1;

    //user's data

    this.DATA_BYTE_OFFSET = 0;
    this.NODE_DATA_BYTE_OFFSET = deps.heap.dataSize - SharedDoublyLinkedList.HEADER_BYTES - this.deps.nodeDataSize; // prettier-ignore

    assert(this.NODE_DATA_BYTE_OFFSET >= 0);
    assert(this.NODE_DATA_BYTE_OFFSET >= this.DATA_BYTE_OFFSET + this.deps.dataSize); // prettier-ignore
  }

  /**
   *
   */
  public static getDataAvailable = (pageSize: number, nodeDataSize: number) =>
    pageSize - SharedDoublyLinkedList.HEADER_BYTES - nodeDataSize;

  /**
   *
   */
  public getHead = <T extends TypedArray, U extends TypedArray>(
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => {
    if (this.rootRef === undefined) {
      return;
    }

    return this.get(this.rootRef, NodeTypedArray, TypedArray);
  };

  /**
   *
   */
  public get = <T extends TypedArray, U extends TypedArray>(
    ref: number,
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => {
    const array = this.deps.heap.get(ref, TypedArray);

    return {
      ref,
      raw: array, //only for internal use.
      nodeData: this.getNodeDataArray(ref, NodeTypedArray),
      data: this.getDataArray(ref, TypedArray),
    } as LinkedListNode<T, U> & InternalNode;
  };

  /**
   *
   */
  public getNodeDataArray = <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    assert(Number.isInteger(this.deps.nodeDataSize / TypedArray.BYTES_PER_ELEMENT), "TypedArray must divide node data size: ", {TypedArray, nodeDataSize:this.deps.nodeDataSize}); // prettier-ignore

    const array = this.deps.heap.get(ref, TypedArray);

    return makeTypedArray(
      array,
      TypedArray,
      this.NODE_DATA_BYTE_OFFSET,
      this.deps.nodeDataSize / TypedArray.BYTES_PER_ELEMENT
    );
  };

  /**
   *
   */
  public getDataArray = <T extends TypedArray>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    assert(Number.isInteger(this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT), "TypedArray must divide data size: ", {TypedArray, dataSize:this.deps.dataSize}); // prettier-ignore

    const array = this.deps.heap.get(ref, TypedArray);

    return makeTypedArray(
      array,
      TypedArray,
      this.DATA_BYTE_OFFSET,
      this.deps.dataSize / TypedArray.BYTES_PER_ELEMENT
    );
  };

  /**
   *
   */
  public prevRef = (node: LinkedListNode<any, any>) => {
    const ref = (node as unknown as InternalNode).raw[this.PREVIOUS_OFFSET];

    if (ref === -1 /* UINT32_UNDEFINED */) {
      return;
    } else {
      return ref;
    }
  };

  /**
   *
   */
  public nextRef = (node: LinkedListNode<any, any>) => {
    const ref = (node as unknown as InternalNode).raw[this.NEXT_OFFSET];

    if (ref === -1 /* UINT32_UNDEFINED */) {
      return;
    } else {
      return ref;
    }
  };

  /**
   *
   */
  public appendNew = <T extends TypedArray, U extends TypedArray>(
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => {
    if (this.rootRef !== undefined) {
      throw new Error("not impl");
    }

    //only works when empty.

    const alloc = this._allocate(NodeTypedArray, TypedArray);

    this.rootRef = alloc.ref;

    //book keeping

    this.count++;

    this._invariant();

    return alloc as LinkedListNode<T, U>;
  };

  /**
   * Creates a new node after the given node.
   */
  public insertNew = <T extends TypedArray, U extends TypedArray>(
    pos: LinkedListNode<any, any>,
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ) => {
    const posArray = (pos as unknown as InternalNode).raw;

    if (posArray[this.NEXT_OFFSET] !== -1) {
      throw new Error("not impl");
    }

    // only works when appending to the end.

    const next = this._allocate(NodeTypedArray, TypedArray);

    posArray[this.NEXT_OFFSET] = next.ref;
    next.raw[this.PREVIOUS_OFFSET] = pos.ref;

    //book keeping

    this.count++;

    this._invariant();

    return next as LinkedListNode<T, U>;
  };

  /**
   *
   */
  public move = (
    node: LinkedListNode<any, any>,
    pos: LinkedListNode<any, any>,
    before = true
  ) => {
    this._delete(node);
    this._insert(pos, node, before);

    this._invariant();
  };

  /**
   *
   * - It's not allowed to delete twice.
   *    - An attempt to warn when it happens is made, but it can't be perfect, because the node
   *      is deallocated, so no information can be stored there.
   * - Also deallocates the node.
   *
   * impl
   * - We can't be certain the heap will throw, if the node has already been deallocated. It could reuse references.
   * - we need to deallocate first before removing from list, because the reference might be invalid, and we
   *    we would corrupt the list, if we mutated it before the heap throws.
   *
   */
  public delete = (node: LinkedListNode<any, any>) => {
    assert((node as any).deleted !== true, "Node is already deleted.");

    //read data before deallocate

    const array = (node as unknown as InternalNode).raw;

    const prevRef = array[this.PREVIOUS_OFFSET];
    const nextRef = array[this.NEXT_OFFSET];

    //remove from heap

    this.deps.heap.deallocate(node.ref);

    //remove from list

    this._delete_real(node.ref, prevRef, nextRef);

    (node as any).deleted = true; //what ever value. Nobody should use this object after delete.

    //book keeping

    this.count--;

    this._invariant();
  };

  /**
   * - Set root node correctly if needed.
   */
  private _insert = (
    pos: LinkedListNode<any, any>,
    node: LinkedListNode<any, any>,
    before = true
  ) => {
    const nodeArray = (node as unknown as InternalNode).raw;
    const posArray = (pos as unknown as InternalNode).raw;

    if (before) {
      const prevRef = posArray[this.PREVIOUS_OFFSET];

      //forward

      posArray[this.PREVIOUS_OFFSET] = node.ref;
      nodeArray[this.NEXT_OFFSET] = pos.ref;

      //backwards

      nodeArray[this.PREVIOUS_OFFSET] = prevRef; //same as undefined

      if (prevRef === -1) {
        //it's before root

        this.rootRef = node.ref;
      } else {
        const prev = this.deps.heap.get(prevRef, Int32Array);

        prev[this.NEXT_OFFSET] = node.ref;
      }
    } else {
      const nextRef = posArray[this.NEXT_OFFSET];

      //backwards

      posArray[this.NEXT_OFFSET] = node.ref;
      nodeArray[this.PREVIOUS_OFFSET] = pos.ref;

      //forward

      nodeArray[this.NEXT_OFFSET] = nextRef; //might be undefined

      if (nextRef !== -1) {
        const next = this.deps.heap.get(nextRef, Int32Array);

        next[this.PREVIOUS_OFFSET] = node.ref;
      }
    }

    this._invariant();
  };

  /**
   *
   */
  private _delete = (node: LinkedListNode<any, any>) => {
    const array = (node as unknown as InternalNode).raw;

    const prevRef = array[this.PREVIOUS_OFFSET];
    const nextRef = array[this.NEXT_OFFSET];

    this._delete_real(node.ref, prevRef, nextRef);
  };

  /**
   *
   * impl
   * - Sets root node correctly if needed.
   *
   */
  private _delete_real = (ref: number, prevRef: number, nextRef: number) => {
    //backward link

    if (prevRef === -1 /* UINT32_UNDEFINED */) {
      //root page

      if (nextRef === -1 /* UINT32_UNDEFINED */) {
        //it's the only page, so we leave it.

        this.rootRef = undefined;
      } else {
        // it has a next page, which must become the new root.

        this.rootRef = nextRef;
      }
    } else {
      //non-root page

      const prev = this.deps.heap.get(prevRef, Int32Array);

      assert(prev[this.NEXT_OFFSET] === ref);

      //update links on previous page

      prev[this.NEXT_OFFSET] = nextRef; //might be UINT32_UNDEFINED
    }

    //forward link

    if (nextRef !== -1 /* UINT32_UNDEFINED */) {
      // it has a next page

      const next = this.deps.heap.get(nextRef, Int32Array);

      assert(next[this.PREVIOUS_OFFSET] === ref);

      next[this.PREVIOUS_OFFSET] = prevRef; //might be UINT32_UNDEFINED
    }
  };

  /**
   * Allocate a new node, but not attached to the list, yet.
   */
  public _allocate = <T extends TypedArray, U extends TypedArray>(
    NodeTypedArray: TypedArrayContructor<T>,
    TypedArray: TypedArrayContructor<U>
  ): LinkedListNode<T, U> & InternalNode => {
    const alloc = this.deps.heap.allocate(Int32Array);

    alloc.array[this.PREVIOUS_OFFSET] = UINT32_UNDEFINED;
    alloc.array[this.NEXT_OFFSET] = UINT32_UNDEFINED;

    try {
      return {
        ref: alloc.ref,
        raw: alloc.array, //only for internal use.
        nodeData: this.getNodeDataArray(alloc.ref, NodeTypedArray), //could throw on bad user input
        data: this.getDataArray(alloc.ref, TypedArray), //ditto
      };
    } catch (error) {
      this.deps.heap.deallocate(alloc.ref);
      throw error;
    }
  };

  /**
   *
   */
  private _invariant = () => {
    let actualCount = 0;
    let prev: LinkedListNode<Int32Array, Int32Array> | undefined;

    for (const node of this) {
      actualCount++;

      //prev link

      if (prev !== undefined) {
        assert(this.prevRef(node) === prev.ref);
      }

      prev = node;
    }

    assertEq(this.count, actualCount);
  };

  /**
   *
   */
  public *[Symbol.iterator](): Generator<
    LinkedListNode<Int32Array, Int32Array>
  > {
    let node = this.getHead(Int32Array, Int32Array);

    while (node !== undefined) {
      yield node;

      //next iteration

      const next = this.nextRef(node);

      if (next === undefined) {
        break;
      }

      node = this.get(next, Int32Array, Int32Array);
    }
  }

  /**
   *
   */
  public toString = () => {
    let res = "";

    for (const node of this) {
      res += tos({ ref: node.ref, nodeData: node.nodeData, data: node.data }) + "\n"; // prettier-ignore
    }

    return "DoublyLinkedList (" + this.count + ")\n" + res;
  };
}
