import {
  assert,
  err,
  makeTypedArray,
  TypedArray,
  TypedArrayContructor,
  assertEq,
} from "^jab";
import {
  HeapFactory,
  TreeMap,
  FixedSizeHeap,
  UINT32_UNDEFINED,
  Allocation,
} from "^shared-algs";

const COLOR_LENGTH = 1;
const PARENT_LENGTH = 1;
const LEFT_LENGTH = 1;
const RIGHT_LENGTH = 1;

const HEADER_BYTES =
  (COLOR_LENGTH + PARENT_LENGTH + LEFT_LENGTH + RIGHT_LENGTH) *
  Uint32Array.BYTES_PER_ELEMENT;

const NODE_DATA_BYTE_OFFSET = 0; //because there's no user data, yet.

export type SharedRedBlackTreeBaseDeps<K, V, N extends TypedArray> = {
  ref?: number;
  heapFactory: HeapFactory;

  nodeDataByteSize: number;
  NodeTypedArray: TypedArrayContructor<N>;

  getKey: (nodeData: N) => K;
  setKey: (nodeData: N, key: K) => void;
  getValue: (nodeData: N) => V;
  setValue: (nodeData: N, value: V) => void;
  keyEquals: (nodeData1: N | K, nodeData2: N) => boolean;
  keyLessThan: (key: K, nodeData2: N) => boolean;

  //for testing

  verifyAfterOperations: boolean;
};

//meta data

const NODE_COUNT_OFFSET = 0; //number of allocated chunks.

const TREE_ROOT_REF_OFFSET = NODE_COUNT_OFFSET + 1;

const META_DATA_LENGTH = TREE_ROOT_REF_OFFSET + 1;

const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 *
 * specs
 *  - user is responsible for storing the node key in nodeData.
 *
 * properties
 *  - red nodes doesn't have red children.
 *  - all paths from root to leaves have the same number of black nodes.
 *
 * inferred
 *  - a black node can have single child, only if it's red.
 *  - red nodes have either no children or two black children.
 *
 * notes
 *  - `considered black` is expressed as `!node?.red`
 *  - `not considered black` is expressed as `node?.red`
 *
 * source:        https://en.wikipedia.org/wiki/Red–black_tree
 * related work:  https://github.com/vadimg/js_bintrees
 *
 */
export class SharedRedBlackTreeBase<K, V, N extends TypedArray>
  implements Iterable<[K, V]>, TreeMap<K, V>
{
  private decl: Allocation<Uint32Array>;

  private heap: FixedSizeHeap;

  //depends on configuration

  private readonly COLOR_OFFSET: number;
  private readonly PARENT_OFFSET: number;
  private readonly LEFT_OFFSET: number;
  private readonly RIGHT_OFFSET: number;

  /**
   *
   */
  constructor(private deps: SharedRedBlackTreeBaseDeps<K, V, N>) {
    assert(Number.isInteger(this.deps.nodeDataByteSize / deps.NodeTypedArray.BYTES_PER_ELEMENT), "TypedArray must divide node data size: ", {NodeTypedArray:deps.NodeTypedArray, nodeDataSize:this.deps.nodeDataByteSize}); // prettier-ignore
    assert(this.deps.nodeDataByteSize >= 0, undefined, "Node data size must be positive: " + this.deps.nodeDataByteSize); // prettier-ignore

    const heapDataSize = HEADER_BYTES + this.deps.nodeDataByteSize;

    this.heap = deps.heapFactory.get(heapDataSize);

    //position links at the end of the page

    const pageLength = heapDataSize / Uint32Array.BYTES_PER_ELEMENT;

    this.RIGHT_OFFSET = pageLength - RIGHT_LENGTH;
    this.LEFT_OFFSET = this.RIGHT_OFFSET - LEFT_LENGTH;
    this.PARENT_OFFSET = this.LEFT_OFFSET - PARENT_LENGTH;
    this.COLOR_OFFSET = this.PARENT_OFFSET - COLOR_LENGTH; //a little wasteful.

    //space for node data.

    assert(this.COLOR_OFFSET * Uint32Array.BYTES_PER_ELEMENT >= NODE_DATA_BYTE_OFFSET + this.deps.nodeDataByteSize); // prettier-ignore

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
      this.decl.array[TREE_ROOT_REF_OFFSET] = UINT32_UNDEFINED;
    }
  }

  /**
   *
   */
  public static getPageByteSize = (nodeDataByteSize: number) =>
    HEADER_BYTES + nodeDataByteSize;

  /**
   *
   */
  public getRef = () => this.decl.ref;

  /**
   *
   */
  public static fromRef = <K, V, N extends TypedArray>(
    deps: SharedRedBlackTreeBaseDeps<K, V, N>,
    ref: number
  ) => new SharedRedBlackTreeBase({ ...deps, ref });

  /**
   *
   */
  get size() {
    return this.decl.array[NODE_COUNT_OFFSET];
  }

  /**
   *
   */
  private set size(value: number) {
    this.decl.array[NODE_COUNT_OFFSET] = value;
  }

  /**
   *
   */
  private get rootRef() {
    return this.decl.array[TREE_ROOT_REF_OFFSET];
  }

  /**
   * todo: would it be better to use UINT32_UNDEFINED directly
   */
  private set rootRef(value: number) {
    this.decl.array[TREE_ROOT_REF_OFFSET] = value;
  }

  /**
   * Search the tree to identify and return the node for the specified key.
   */
  public searchNode = (key: K) => {
    let ref: number = this.rootRef;

    while (ref !== UINT32_UNDEFINED) {
      const array = this.heap.get(ref, Uint32Array);

      const nodeData = this.getNodeDataArrayReal(array);

      if (this.deps.keyEquals(key, nodeData)) {
        return { ref, array };
      } else if (this.deps.keyLessThan(key, nodeData)) {
        ref = this.getLeft(array);
      } else {
        ref = this.getRight(array);
      }
    }

    return; //not found
  };

  /**
   *
   */
  public has = (key: K) => this.searchNode(key) !== undefined;

  /**
   *
   */
  public get = (key: K) => {
    const alloc = this.searchNode(key);

    if (alloc === undefined) {
      return;
    }

    return this.deps.getValue(this.getNodeDataArrayReal(alloc.array));
  };

  /**
   *
   */
  private getNodeDataArrayReal = (raw: Uint32Array) =>
    makeTypedArray(
      raw,
      this.deps.NodeTypedArray,
      NODE_DATA_BYTE_OFFSET,
      this.deps.nodeDataByteSize / this.deps.NodeTypedArray.BYTES_PER_ELEMENT
    );

  /**
   *
   * - Find the leaf-position, that is consistent with the tree order.
   * - Or replace value if the given key already exists.
   *
   */
  public set = (key: K, value: V) => {
    let parentRef: number = UINT32_UNDEFINED;
    let dir: "left" | "right" | undefined = undefined;
    let nodeRef = this.rootRef;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (nodeRef === UINT32_UNDEFINED) {
        //found correct position, so we insert the node here.
        this._actualInsert(key, value, parentRef, dir);
        break;
      }

      const nodeArray = this.heap.get(nodeRef, Uint32Array);

      //renmae userData
      const nodeData = this.getNodeDataArrayReal(nodeArray);

      if (this.deps.keyEquals(key, nodeData)) {
        this.deps.setValue(nodeData, value);
        break;
      } else if (this.deps.keyLessThan(key, nodeData)) {
        parentRef = nodeRef;
        nodeRef = this.getLeft(nodeArray);
        dir = "left";
      } else {
        parentRef = nodeRef;
        nodeRef = this.getRight(nodeArray);
        dir = "right";
      }
    }

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   *
   * 1. Insert a node at a leaf position consistent with sort order.
   * 2. Move up the tree incrementally correcting the red-black properties.
   */
  private _actualInsert = (
    key: K,
    value: V,
    parentRef: number,
    parentDir?: "left" | "right"
  ) => {
    this.size++;

    //allocate space for new node

    let node = this._allocate(key, value, parentRef);

    //begin insert

    if (parentRef === UINT32_UNDEFINED) {
      this.rootRef = node.ref;
      return;
    }

    let parentArray = this.heap.get(parentRef, Uint32Array);

    this.setChild(parentArray, parentDir!, node.ref);

    // now the red/black properties must be checked.

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (parentArray === undefined) {
        throw new Error("Impossible");
      }

      const grandRef = this.getParent(parentArray);

      if (!this.isRed(parentArray)) {
        // Case 1
        //no red-violation.
        //and we have only inserted a red node, so black violation isn't possible either.
        return;
      }

      if (grandRef === UINT32_UNDEFINED) {
        //case 4
        //parent is the root node and is red.
        //we can fix the red-violation by simply changing the parent into black.
        //it increases the length of all black-paths by 1.
        this.setRed(parentArray, false);
        return;
      }

      //find uncle

      const grandArray = this.heap.get(grandRef, Uint32Array);

      const grandParentSide = this.childDirection(parentRef, grandArray);
      const otherGrandParentSide = reverseDirection(grandParentSide);

      const uncleRef = this.getChild(grandArray, otherGrandParentSide);
      const uncleArray =
        uncleRef === UINT32_UNDEFINED
          ? undefined
          : this.heap.get(uncleRef, Uint32Array);

      // case 5/6

      if (!(uncleArray && this.isRed(uncleArray))) {
        this._insert_case5_6(
          node.ref,
          node.array,
          parentRef,
          parentArray,
          grandRef,
          grandArray,
          grandParentSide
        );
        return;
      }

      //case 2: there is a grandparent and both parent and uncle is red. Hence grandparent must be black.

      this.setRed(parentArray, false);
      this.setRed(uncleArray, false);
      this.setRed(grandArray, true);

      //prepare for next iteration

      node = { ref: grandRef, array: grandArray };
      parentRef = this.getParent(node.array);

      if (parentRef === UINT32_UNDEFINED) {
        //case 3
        return;
      }

      parentArray = this.heap.get(parentRef, Uint32Array);
    }
  };

  /**
   * case:
   *  - Parent is red
   *  - Uncle is undefined or black
   */
  private _insert_case5_6 = (
    nodeRef: number,
    nodeArray: Uint32Array,
    parentRef: number,
    parentArray: Uint32Array,
    grandRef: number,
    grandArray: Uint32Array,
    grandParentSide: "left" | "right"
  ) => {
    const reverse = reverseDirection(grandParentSide);

    // case5: check if node is an 'inner grandchild'

    const ref = this.getChild(parentArray, reverse);

    if (nodeRef === ref) {
      //rotate so the node isn't the inner grandchild.

      this._rotate(parentRef, parentArray, grandParentSide);

      //use the node as 'parent' instead. The original parent is outer grandchild now.

      parentArray = nodeArray;

      //continue with case 6
    }

    // case 6

    this.setRed(parentArray, false);
    this.setRed(grandArray, true);

    this._rotate(grandRef, grandArray, reverse);
  };

  /**
   *
   *  - Find the node, that should be deleted.
   *  - Handle the 'simple' cases.
   *
   *    Can be reordered to:
   *      2 children  It is moved, so it has either 0 or 1 child, and falls through to below cases.
   *      1 child     It can be moved up and replace the deleted node.
   *      0 children  If root or red it is handled here. Otherwise by `_actualDeleteCases`
   *
   * impl
   *  - `_delete` throws, if not found, so it's safe to always deallocate.
   */
  public delete = (key: K) => {
    const ref = this._delete(key);

    this.size--;

    this.heap.deallocate(ref);

    this.deps.verifyAfterOperations && this._invariant();
  };

  /**
   *
   */
  public _delete = (key: K) => {
    const alloc = this.searchNode(key);

    if (alloc === undefined) {
      throw new Error("Not found: " + key);
    }

    //state

    let nodeRef = alloc.ref;
    let nodeArray = alloc.array;
    let nodeLeft = this.getLeft(nodeArray);
    let nodeRight = this.getRight(nodeArray);

    //two children.

    if (nodeLeft !== UINT32_UNDEFINED && nodeRight !== UINT32_UNDEFINED) {
      const newNodeToDelete = this._switch(nodeArray);

      //update state

      nodeRef = newNodeToDelete.ref;
      nodeArray = newNodeToDelete.array;
      nodeLeft = this.getLeft(nodeArray);
      nodeRight = this.getRight(nodeArray);

      //fall through to delete the moved node.
    }

    const parentRef = this.getParent(nodeArray);
    const parentArray =
      parentRef === UINT32_UNDEFINED
        ? undefined
        : this.heap.get(parentRef, Uint32Array);

    // no children

    if (nodeLeft === UINT32_UNDEFINED && nodeRight === UINT32_UNDEFINED) {
      if (parentArray === undefined) {
        //it's root, and can simply be removed.
        this.rootRef = UINT32_UNDEFINED;

        return nodeRef;
      }

      if (this.isRed(nodeArray)) {
        //it's red and has no children, so it can simply be removed from parent.

        this.setChild(
          parentArray,
          this.childDirection(nodeRef, parentArray),
          UINT32_UNDEFINED
        );

        return nodeRef;
      } else {
        //black non-root with no children
        this._actualDeleteCases(nodeRef, nodeArray);

        return nodeRef;
      }
    }

    // one child

    const oneChild =
      nodeLeft === UINT32_UNDEFINED
        ? nodeRight !== UINT32_UNDEFINED
        : nodeRight === UINT32_UNDEFINED;

    assert(oneChild === (nodeLeft !== nodeRight));
    assert(oneChild);

    //one child, so node must be black node with red child.

    const childRef = nodeLeft !== UINT32_UNDEFINED ? nodeLeft : nodeRight;

    const childArray = this.heap.get(childRef, Uint32Array);

    //the child is red, so can't have red children. Further can't have black children, because its parent
    // has only one child. Hence: there is no grandchildren.

    if (parentArray) {
      //the child takes the place (and color) of the deleted node.

      this.setRed(childArray, false);
      this.setParent(childArray, parentRef);

      this.setChild(
        parentArray,
        this.childDirection(nodeRef, parentArray),
        childRef
      );
    } else {
      //the child can replace the root, because it's the only node left.

      this.rootRef = childRef;
      this.setParent(childArray, UINT32_UNDEFINED);
    }

    return nodeRef;
  };

  /**
   * Switch node with another, that has at most one child.
   *
   *  - We switch with the successor node.
   *  - This operation is only legal, if the returned node is deleted, afterwards.
   *      Because the order of the two nodes becomes incorrect.
   */
  private _switch = (sourceArray: Uint32Array) => {
    // Find smallest value in right subtree.

    let ref = this.getRight(sourceArray);
    let array = this.heap.get(ref, Uint32Array);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tmpRef = this.getLeft(array);

      if (tmpRef === UINT32_UNDEFINED) {
        break;
      }

      ref = tmpRef;
      array = this.heap.get(tmpRef, Uint32Array);
    }

    //move key/value data to the source node, because that is preserved in the tree.

    this.deps.setKey(
      this.getNodeDataArrayReal(sourceArray),
      this.deps.getKey(this.getNodeDataArrayReal(array))
    );

    this.deps.setValue(
      this.getNodeDataArrayReal(sourceArray),
      this.deps.getValue(this.getNodeDataArrayReal(array))
    );

    //return a reference to the node which must be deleted.

    return { ref, array };
  };

  /**
   * handles black non-root nodes with no children
   *
   *  - removes the node from parent
   *  - goes through various cases to remove a black-level on parent's other branch.
   */
  private _actualDeleteCases = (nodeRef: number, nodeArray: Uint32Array) => {
    //pre-conditions

    assert(!this.isRed(nodeArray));

    assert(
      this.getLeft(nodeArray) === UINT32_UNDEFINED &&
        this.getRight(nodeArray) === UINT32_UNDEFINED
    ); //has no children

    let parentRef = this.getParent(nodeArray);

    if (parentRef === UINT32_UNDEFINED) {
      throw new Error("Parent should be set here.");
    }

    let parentArray = this.heap.get(parentRef, Uint32Array);

    let dir: "left" | "right" = this.childDirection(nodeRef, parentArray);

    // remove the node

    this.setChild(parentArray, dir, UINT32_UNDEFINED);

    //loop invariant
    //  node is black and have a parent.
    //  parent has black height one too big on the other branch.

    do {
      //prepare family

      const reverse = reverseDirection(dir);

      const siblingRef = this.getChild(parentArray, reverse);

      if (siblingRef === UINT32_UNDEFINED) {
        throw new Error("Black nodes should always have a sibling."); //otherwise it would be a black-violation
      }

      const siblingArray = this.heap.get(siblingRef, Uint32Array); //child is in the reverse direction of rotation.

      const distantNephewRef = this.getChild(siblingArray, reverse);

      const distantNephewArray =
        distantNephewRef === UINT32_UNDEFINED
          ? undefined
          : this.heap.get(distantNephewRef, Uint32Array);

      const closeNephewRef = this.getChild(siblingArray, dir);

      const closeNephewArray =
        closeNephewRef === UINT32_UNDEFINED
          ? undefined
          : this.heap.get(closeNephewRef, Uint32Array);

      //cases

      if (this.isRed(siblingArray)) {
        // case 3

        this._rotate(parentRef, parentArray, dir);

        // parent.red = true;
        this.setRed(parentArray, true);
        this.setRed(siblingArray, false); //ensure we won't hit this case again, and get progress.

        //continue will hit one of the cases: 4, 5 or 6.

        continue;
      }

      if (distantNephewArray && this.isRed(distantNephewArray)) {
        // case 6
        this._deleteCase6(
          parentRef,
          parentArray,
          siblingArray,
          distantNephewArray,
          dir
        );
        return;
      }

      if (closeNephewArray && this.isRed(closeNephewArray)) {
        // case 5
        this._deleteCase5(
          parentRef,
          parentArray,
          siblingRef,
          siblingArray,
          closeNephewArray,
          distantNephewArray,
          dir
        );
        return;
      }

      if (this.isRed(parentArray)) {
        //case 4
        this.setRed(siblingArray, true);
        this.setRed(parentArray, false);
        // parent.red = false;
        return;
      }

      //case 1 - P, S, C and D are black

      this.setRed(siblingArray, true);

      //prepare for next iteration

      nodeRef = parentRef;
      nodeArray = parentArray;

      parentRef = this.getParent(nodeArray);

      if (parentRef !== UINT32_UNDEFINED) {
        //only bother updating, if we continue in the loop
        parentArray = this.heap.get(parentRef, Uint32Array);
        dir = this.childDirection(nodeRef, parentArray);
      }
    } while (parentRef !== UINT32_UNDEFINED);

    //case 2 - root is reached.
  };

  /**
   *
   */
  private _deleteCase5 = (
    parentRef: number,
    parentArray: Uint32Array,
    siblingRef: number,
    siblingArray: Uint32Array,
    closeNephewArray: Uint32Array,
    distantNephewArray: Uint32Array | undefined,
    dir: "left" | "right"
  ) => {
    assert(!this.isRed(siblingArray));

    const reverse = reverseDirection(dir);

    //case 5

    this._rotate(siblingRef, siblingArray, reverse);
    // sibling.red = true; /* overwriten in case 6 - so no need */
    // closeNephew.red = false; /* overwriten in case 6 - so no need */
    distantNephewArray = siblingArray;
    siblingArray = closeNephewArray;

    //case 6

    this._deleteCase6(
      parentRef,
      parentArray,
      siblingArray,
      distantNephewArray,
      dir
    );
  };

  /**
   *
   */
  private _deleteCase6 = (
    parentRef: number,
    parentArray: Uint32Array,
    siblingArray: Uint32Array,
    distantNephewArray: Uint32Array,
    dir: "left" | "right"
  ) => {
    this._rotate(parentRef, parentArray, dir);

    this.setRed(siblingArray, this.isRed(parentArray));
    this.setRed(parentArray, false);
    this.setRed(distantNephewArray, false);
  };

  /**
   * Rotate the node down. In either left or right direction.
   *
   *  - The child in the other direction is rotated up.
   *  - innerGrandchild moves from child to node.
   */
  private _rotate = (
    nodeRef: number,
    nodeArray: Uint32Array,
    dir: "left" | "right"
  ) => {
    const reverse = reverseDirection(dir);

    // store parent of the node to rotate down

    const parentRef = this.getParent(nodeArray);
    const parentArray = parentRef === UINT32_UNDEFINED ? undefined : this.heap.get(parentRef, Uint32Array); // prettier-ignore

    const nodeDir = parentArray && this.childDirection(nodeRef, parentArray);

    //get child that is rotated up.

    const childRef = this.getChild(nodeArray, reverse);

    if (childRef === UINT32_UNDEFINED) {
      throw err("No child to rotate up.", { nodeRef, direction: reverse });
    }

    const childArray = this.heap.get(childRef, Uint32Array); //child is in the reverse direction of rotation.

    //node gets its inner grandchild as new child, instead of the child which is rotated up.

    const innerGrandchildRef = this.getChild(childArray, dir);

    this.setChild(nodeArray, reverse, innerGrandchildRef);

    if (innerGrandchildRef !== UINT32_UNDEFINED) {
      const innerGrandchildArray = this.heap.get(innerGrandchildRef, Uint32Array); // prettier-ignore

      this.setParent(innerGrandchildArray, nodeRef);
    }

    //the node is placed on the free space where the inner grandchild was.

    this.setChild(childArray, dir, nodeRef);

    this.setParent(nodeArray, childRef);

    //child is now the new 'top' node, and its parent is the parent.

    this.setParent(childArray, parentRef);

    //finally

    if (parentArray === undefined) {
      //node was the root, so child is the new root.
      this.rootRef = childRef;
    } else {
      //parent needs to link to the new 'top' node.
      this.setChild(parentArray, nodeDir!, childRef);
    }
  };

  /**
   *
   */
  private keyEqualsByRawArray = (a: Uint32Array, b: Uint32Array) =>
    this.deps.keyEquals(
      this.getNodeDataArrayReal(a),
      this.getNodeDataArrayReal(b)
    );

  /**
   * The direction that the child is reached from the parent node.
   */
  private childDirection = (nodeRef: number, parentArray: Uint32Array) =>
    nodeRef === this.getLeft(parentArray) ? "left" : "right";

  /**
   *
   */
  private isRed = (array: Uint32Array) => array[this.COLOR_OFFSET] === 1;

  /**
   *
   */
  private setRed = (array: Uint32Array, red: boolean) => {
    array[this.COLOR_OFFSET] = red ? 1 : 0;
  };

  /**
   *
   */
  private getParent = (array: Uint32Array) => array[this.PARENT_OFFSET];

  private setParent = (array: Uint32Array, ref: number) => {
    array[this.PARENT_OFFSET] = ref;
  };

  /**
   *
   */
  private getChild = (array: Uint32Array, direction: "left" | "right") =>
    direction === "left" ? this.getLeft(array) : this.getRight(array);

  /**
   *
   */
  private setChild = (
    array: Uint32Array,
    direction: "left" | "right",
    node: number
  ) => {
    direction === "left"
      ? this.setLeft(array, node)
      : this.setRight(array, node);
  };

  /**
   *
   */
  private getLeft = (array: Uint32Array) => array[this.LEFT_OFFSET];

  /**
   *
   */
  private setLeft = (array: Uint32Array, ref: number) => {
    array[this.LEFT_OFFSET] = ref;
  };

  /**
   *
   */
  private getRight = (array: Uint32Array) => array[this.RIGHT_OFFSET];

  /**
   *
   */
  private setRight = (array: Uint32Array, ref: number) => {
    array[this.RIGHT_OFFSET] = ref;
  };

  /**
   * Allocate a new node, but not attached to the tree, yet.
   */
  public _allocate = (key: K, value: V, parentRef: number) => {
    const alloc = this.heap.allocate(Uint32Array);

    try {
      //enter data

      this.deps.setKey(this.getNodeDataArrayReal(alloc.array), key); //might throw on bad user input.
      this.deps.setValue(this.getNodeDataArrayReal(alloc.array), value); //ditto
      this.setRed(alloc.array, true); //new nodes are always red
      this.setParent(alloc.array, parentRef);
      this.setLeft(alloc.array, UINT32_UNDEFINED);
      this.setRight(alloc.array, UINT32_UNDEFINED);

      return alloc;
    } catch (error) {
      this.heap.deallocate(alloc.ref);
      throw error;
    }
  };

  /**
   *
   * rewrite with the iterator
   */
  private _invariant = () => {
    let globalBlackCount: number | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let actualSize = 0;

    helper(0, this.rootRef, undefined);

    assertEq(this.size, actualSize);

    /**
     *  - full dfs traversal.
     */
    function helper(
      blackCount: number,
      nodeRef: number,
      parentArray: Uint32Array | undefined
    ) {
      if (nodeRef === UINT32_UNDEFINED) {
        //check black node count because it's a leaf node.

        if (globalBlackCount === undefined) {
          globalBlackCount = blackCount;
        } else {
          assert(globalBlackCount === blackCount, "Black-violation", {
            expected: globalBlackCount,
            blackCount,
          });
        }

        return;
      }

      actualSize++;

      const nodeArray = self.heap.get(nodeRef, Uint32Array);

      //info

      const nodeRed = self.isRed(nodeArray);
      const parentRed = parentArray && self.isRed(parentArray);

      //check parent key

      const parentRef = self.getParent(nodeArray);

      if (parentArray === undefined) {
        assert(parentRef === UINT32_UNDEFINED);
      } else {
        if (parentRef === UINT32_UNDEFINED) {
          throw new Error("Parent key didn't exist.");
        }

        const actualParentArray = self.heap.get(parentRef, Uint32Array);

        if (!self.keyEqualsByRawArray(actualParentArray, parentArray)) {
          err("Parent key is not correct: ", {
            nodeArray,
            parentArray,
          });
        }
      }

      //check for red-violation

      if (nodeRed && parentRed) {
        err("Red-violation", { nodeArray, parentArray });
      }

      //recurse

      const newCount = nodeRed ? blackCount : blackCount + 1;

      helper(newCount, self.getLeft(nodeArray), nodeArray);
      helper(newCount, self.getRight(nodeArray), nodeArray);
    }
  };

  /**
   *
   */
  public dispose = () => {
    assert(this.size === 0, "Can only dispose when empty.");

    this.deps.heapFactory.get(META_DATA_BYTES).deallocate(this.decl.ref);
  };

  /**
   * dfs iteration
   */
  public *[Symbol.iterator](): Generator<[K, V]> {
    if (this.rootRef === UINT32_UNDEFINED) {
      return;
    }

    const makeNode = (ref: number) => {
      const nodeArray = this.heap.get(ref, Uint32Array);
      const nodeData = this.getNodeDataArrayReal(nodeArray);

      return { ref, nodeArray, nodeData };
    };

    const nodes: Array<{
      ref: number;
      left?: true;
      right?: true;
      nodeArray: Uint32Array;
      nodeData: N;
    }> = [makeNode(this.rootRef)];

    while (nodes.length !== 0) {
      const node = nodes[nodes.length - 1];

      //recurse to the left before output.

      const left = this.getLeft(node.nodeArray);

      if (left !== UINT32_UNDEFINED && !node.left) {
        node.left = true;
        nodes.push(makeNode(left));
        continue;
      }

      //output node

      if (!node.right) {
        yield [
          this.deps.getKey(node.nodeData),
          this.deps.getValue(node.nodeData),
        ];
      }

      //recurse to the right.

      const right = this.getRight(node.nodeArray);

      if (right !== UINT32_UNDEFINED && !node.right) {
        node.right = true;
        nodes.push(makeNode(right));
        continue;
      }

      // done with this node.

      nodes.pop();
    }
  }
}

//
// util
//

/**
 *
 */
const reverseDirection = (direction: "left" | "right") =>
  direction === "right" ? "left" : "right";
