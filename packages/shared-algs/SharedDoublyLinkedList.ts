import { assert, assertEq, err, makeTypedArray, tos } from "^jab";

import {
  FixedSizeHeap,
  DoublyLinkedListProv,
  UINT32_UNDEFINED,
  HeapFactory,
  DataNode,
  Allocation,
} from "./internal";

export type SharedDoublyLinkedListDeps<N extends { ref: number }> = {
  ref?: number;
  heapFactory: HeapFactory;
  dataSize: number;

  makeNode: (node: DataNode) => N;

  //for testing

  verifyAfterOperations: boolean;
};

type InternalNode = Allocation<Uint32Array>;

const NODE_COUNT_OFFSET = 0; //number of allocated chunks.

const HEAD_REF_OFFSET = NODE_COUNT_OFFSET + 1;

const META_DATA_LENGTH = HEAD_REF_OFFSET + 1;

const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 *
 * invariant
 *  - The node is allocated iff the node is in the list.
 *
 * impl
 *  - Data is on the same page as the header data
 *
 * header/meta data
 *  4 bytes   count
 *  4 bytes   headRef
 *
 * page layout
 *  x bytes   data
 *  4 bytes   ref to prev node
 *  4 bytes   ref to next node
 *
 */
export class SharedDoublyLinkedList<N extends { ref: number }>
  implements DoublyLinkedListProv<N>
{
  private PREVIOUS_OFFSET: number; //depends on page size.
  private NEXT_OFFSET: number;

  private DATA_BYTE_OFFSET = 0; //user's data

  public static HEADER_BYTES = 8; //next and prev uint32

  private pageSize: number;
  private heap: FixedSizeHeap;

  //so we can avoid exposing the raw data.
  private nodeMap: WeakMap<N, InternalNode | "deleted">;

  private decl: Allocation<Uint32Array>;

  /**
   *
   */
  constructor(public deps: SharedDoublyLinkedListDeps<N>) {
    assert(this.deps.dataSize >= 0, undefined, "Data size must be positive: " + this.deps.dataSize); // prettier-ignore

    this.pageSize = SharedDoublyLinkedList.HEADER_BYTES + this.deps.dataSize;

    this.heap = this.deps.heapFactory.get(this.pageSize);

    this.nodeMap = new WeakMap();

    //links at the end of the page

    const pageLength = this.pageSize / Uint32Array.BYTES_PER_ELEMENT;

    this.NEXT_OFFSET = pageLength - 1;
    this.PREVIOUS_OFFSET = pageLength - 2;

    //state

    if (deps.ref !== undefined) {
      this.decl = {
        ref: deps.ref,
        array: this.deps.heapFactory.get(META_DATA_BYTES).get(deps.ref, Uint32Array), // prettier-ignore
      };
    } else {
      this.decl = this.deps.heapFactory.get(META_DATA_BYTES).allocate(Uint32Array); // prettier-ignore

      //initialize

      this.decl.array[NODE_COUNT_OFFSET] = 0;
      this.decl.array[HEAD_REF_OFFSET] = UINT32_UNDEFINED;
    }
  }

  /**
   *
   */
  public static getDataAvailable = (pageSize: number) =>
    pageSize - SharedDoublyLinkedList.HEADER_BYTES;

  /**
   *
   */
  public pack = (): Omit<
    SharedDoublyLinkedListDeps<N>,
    "heapFactory" | "makeNode" | "verifyAfterOperations"
  > => ({
    dataSize: this.deps.dataSize,
    ref: this.deps.ref,
  });

  /**
   *
   */
  get count() {
    return this.decl.array[NODE_COUNT_OFFSET];
  }

  /**
   *
   */
  get headRef() {
    return this.decl.array[HEAD_REF_OFFSET];
  }

  /**
   *
   */
  set headRef(ref: number) {
    this.decl.array[HEAD_REF_OFFSET] = ref;
  }

  /**
   *
   */
  public getHead = () => {
    if (this.headRef === UINT32_UNDEFINED) {
      return;
    }

    return this.get(this.headRef);
  };

  /**
   *
   */
  public get = (ref: number) => {
    const array = this.heap.get(ref, Uint32Array);

    return this.makeNode({ ref, array });
  };

  /**
   *
   */
  public prevRef = (node: N) => {
    const alloc = this.mapToInternal(node);

    const ref = alloc.array[this.PREVIOUS_OFFSET];

    if (ref === UINT32_UNDEFINED) {
      return;
    } else {
      return ref;
    }
  };

  /**
   *
   */
  public nextRef = (node: N) => {
    const alloc = this.mapToInternal(node);

    const ref = alloc.array[this.NEXT_OFFSET];

    if (ref === UINT32_UNDEFINED) {
      return;
    } else {
      return ref;
    }
  };

  /**
   *
   */
  public appendNew = () => {
    if (this.headRef !== UINT32_UNDEFINED) {
      throw new Error("not impl");
    }

    //only works when empty.

    const alloc = this._allocate();

    this.headRef = alloc.ref;

    //book keeping

    this.decl.array[NODE_COUNT_OFFSET]++;

    // this.deps.verifyAfterOperations && this._invariant();

    return this.makeNode(alloc);
  };

  /**
   * Creates a new node after the given node.
   */
  public insertNew = (_pos: N) => {
    const pos = this.mapToInternal(_pos);

    if (pos.array[this.NEXT_OFFSET] !== UINT32_UNDEFINED) {
      throw new Error("not impl");
    }

    // only works when appending to the end.

    const next = this._allocate();

    pos.array[this.NEXT_OFFSET] = next.ref;
    next.array[this.PREVIOUS_OFFSET] = pos.ref;

    //book keeping

    this.decl.array[NODE_COUNT_OFFSET]++;

    this.deps.verifyAfterOperations && this._invariant();

    return this.makeNode(next);
  };

  /**
   *
   */
  public move = (_node: N, _pos: N, before = true) => {
    const pos = this.mapToInternal(_pos);
    const node = this.mapToInternal(_node);

    this._delete_from_list(node);
    this._insert(pos, node, before);

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   *
   * - Also deallocates the node.
   * - It's not allowed to delete twice.
   *
   * impl
   *  - Make user's object as "deleted", so we can emit warning if the user tries to do further
   *    operations the the object.
   *
   */
  public delete = (_node: N) => {
    const node = this.mapToInternal(_node);

    //remove from list

    this._delete_from_list(node);

    //remove from heap

    this.heap.deallocate(node.ref);

    //ensure the node object user holds is unusable.

    this.nodeMap.set(_node, "deleted");

    //book keeping

    this.decl.array[NODE_COUNT_OFFSET]--;

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   * - Set root node correctly if needed.
   */
  private _insert = (pos: InternalNode, node: InternalNode, before = true) => {
    const nodeArray = node.array;
    const posArray = pos.array;

    if (before) {
      const prevRef = posArray[this.PREVIOUS_OFFSET];

      //forward

      posArray[this.PREVIOUS_OFFSET] = node.ref;
      nodeArray[this.NEXT_OFFSET] = pos.ref;

      //backwards

      nodeArray[this.PREVIOUS_OFFSET] = prevRef;

      if (prevRef === UINT32_UNDEFINED) {
        //it's before root

        this.headRef = node.ref;
      } else {
        const prev = this.heap.get(prevRef, Uint32Array);

        prev[this.NEXT_OFFSET] = node.ref;
      }
    } else {
      const nextRef = posArray[this.NEXT_OFFSET];

      //backwards

      posArray[this.NEXT_OFFSET] = node.ref;
      nodeArray[this.PREVIOUS_OFFSET] = pos.ref;

      //forward

      nodeArray[this.NEXT_OFFSET] = nextRef; //might be undefined

      if (nextRef !== UINT32_UNDEFINED) {
        const next = this.heap.get(nextRef, Uint32Array);

        next[this.PREVIOUS_OFFSET] = node.ref;
      }
    }

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   * Remove the node from the list without deallocating the node.
   *
   * impl
   * - Sets root node correctly if needed.
   */
  private _delete_from_list = (node: InternalNode) => {
    const prevRef = node.array[this.PREVIOUS_OFFSET];
    const nextRef = node.array[this.NEXT_OFFSET];

    //update backward link

    if (prevRef === UINT32_UNDEFINED) {
      //root page

      if (nextRef === UINT32_UNDEFINED) {
        //it's the only page, so the list is now empty

        this.headRef = UINT32_UNDEFINED;
      } else {
        // it has a next page, which must become the new root.

        this.headRef = nextRef;
      }
    } else {
      //non-root page

      const prev = this.heap.get(prevRef, Uint32Array);

      assert(prev[this.NEXT_OFFSET] === node.ref);

      //update links on previous page

      prev[this.NEXT_OFFSET] = nextRef; //might be UINT32_UNDEFINED
    }

    //update forward link

    if (nextRef !== UINT32_UNDEFINED) {
      // it has a next page

      const next = this.heap.get(nextRef, Uint32Array);

      assert(next[this.PREVIOUS_OFFSET] === node.ref);

      next[this.PREVIOUS_OFFSET] = prevRef; //might be UINT32_UNDEFINED
    }
  };

  /**
   * Allocate a new node, but not attached to the list, yet.
   */
  public _allocate = () => {
    const alloc = this.heap.allocate(Uint32Array);

    alloc.array[this.PREVIOUS_OFFSET] = UINT32_UNDEFINED;
    alloc.array[this.NEXT_OFFSET] = UINT32_UNDEFINED;

    return alloc;
  };

  /**
   *
   */
  private makeNode = (alloc: InternalNode): N => {
    const data = makeTypedArray(
      alloc.array,
      Uint8Array,
      this.DATA_BYTE_OFFSET,
      this.deps.dataSize
    );

    const node = this.deps.makeNode({
      ref: alloc.ref,
      data,
    });

    this.nodeMap.set(node, alloc);

    return node;
  };

  /**
   *
   */
  private mapToInternal = (node: N) => {
    const alloc = this.nodeMap.get(node);

    if (!alloc) {
      throw err("Unknown node", alloc);
    }

    if (alloc === "deleted") {
      throw err("Node has been deleted.", node);
    }

    return alloc;
  };

  /**
   * todo: it's this implicitly calls: `this.makeNode`
   */
  private _invariant = () => {
    let actualCount = 0;
    let prev: N | undefined;

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
  public *[Symbol.iterator](): Generator<N> {
    let node = this.getHead();

    while (node !== undefined) {
      yield node;

      //next iteration

      const next = this.nextRef(node);

      if (next === undefined) {
        break;
      }

      node = this.get(next);
    }
  }

  /**
   *
   */
  public dispose = () => {
    assert(this.count === 0, "Can only dispose when empty.");

    this.deps.heapFactory.get(META_DATA_BYTES).deallocate(this.decl.ref);
  };

  /**
   *
   * - Excludes ref, because it's not important
   */
  public toString = () => {
    let res = "";

    for (const node of this) {
      const clone = { ...node };
      delete (clone as any).ref;
      res += tos(clone) + "\n"; // prettier-ignore
    }

    return "SharedDoublyLinkedList (" + this.count + ")\n" + res;
  };
}
