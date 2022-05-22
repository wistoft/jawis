import {
  assert,
  def,
  err,
  makeTypedArray,
  TypedArray,
  TypedArrayContructor,
} from "^jab";
import { assertEq } from "^jab/error";
import {
  Allocation,
  FixedSizeHeap,
  TreeMap,
  UINT32_UNDEFINED,
} from "./SharedUtil";

export type SharedRedBlackTreeBaseDeps<N extends TypedArray, K, V> = {
  heap: FixedSizeHeap;
  nodeDataSize: number; // in bytes
  NodeTypedArray: TypedArrayContructor<N>;

  //must return true, if both nodeData array are undefined.
  getKey: (nodeData: N) => K;
  setKey: (nodeData: N, key: K) => void;
  getValue: (nodeData: N) => V;
  setValue: (nodeData: N, value: V) => void;
  keyEquals: (nodeData1?: N | K, nodeData2?: N) => boolean;
  keyLessThan: (key: K, nodeData2: N) => boolean;

  //for testing

  verifyAfterOperations: boolean;
};

export const KEY_OFFSET = 0;
const KEY_LENGTH = 1;

export const VALUE_OFFSET = KEY_OFFSET + KEY_LENGTH;
const VALUE_LENGTH = 1;

export const COLOR_OFFSET = VALUE_OFFSET + VALUE_LENGTH; //a little wasteful.
const COLOR_LENGTH = 1;

export const PARENT_OFFSET = COLOR_OFFSET + COLOR_LENGTH;
const PARENT_LENGTH = 1;

export const LEFT_OFFSET = PARENT_OFFSET + PARENT_LENGTH;
const LEFT_LENGTH = 1;

export const RIGHT_OFFSET = LEFT_OFFSET + LEFT_LENGTH;
const RIGHT_LENGTH = 1;

export const HEAP_CHUNCK_SIZE =
  (RIGHT_OFFSET + RIGHT_LENGTH) * Uint32Array.BYTES_PER_ELEMENT;

/**
 *
 * - Maps from integer to integer.
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
export class SharedRedBlackTreeBase<K, V, N extends TypedArray> {
  public size = 0;

  private rootRef?: number;

  private NODE_DATA_BYTE_OFFSET = 0;

  /**
   *
   */
  constructor(private deps: SharedRedBlackTreeBaseDeps<N, K, V>) {
    assert(Number.isInteger(this.deps.nodeDataSize / deps.NodeTypedArray.BYTES_PER_ELEMENT), "TypedArray must divide node data size: ", {NodeTypedArray:deps.NodeTypedArray, nodeDataSize:this.deps.nodeDataSize}); // prettier-ignore
  }

  /**
   * Search the tree to identify and return the node for the specified key.
   */
  public searchNode = (key: K) => {
    let ref: number | undefined = this.rootRef;

    while (ref !== undefined) {
      let array: Uint32Array | undefined = this.deps.heap.get(ref, Uint32Array);

      const nodeData = this.getNodeDataArrayByRawArray(array);

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
  public get = (key: K) => {
    const alloc = this.searchNode(key);

    if (alloc === undefined) {
      return undefined;
    }

    return this.deps.getValue(this.getNodeDataArrayByRawArray(alloc.array));
  };

  /**
   *
   */
  public getNodeDataArrayByRef = (ref: number) => {
    const array = this.deps.heap.get(ref, Uint32Array);

    return this.getNodeDataArrayByRawArray(array);
  };

  /**
   *
   */
  public getNodeDataArrayByRawArray = (raw: Uint32Array) =>
    makeTypedArray(
      raw,
      this.deps.NodeTypedArray,
      this.NODE_DATA_BYTE_OFFSET,
      this.deps.nodeDataSize / this.deps.NodeTypedArray.BYTES_PER_ELEMENT
    );

  /**
   *
   * - Find the leave-position, that is consistent with the tree order.
   * - Or replace value if the given key already exists.
   *
   * note: could be written with: _searchNode
   */
  public set = (key: K, value: V) => {
    let parentRef: number | undefined = undefined;
    let dir: "left" | "right" | undefined = undefined;
    let nodeRef = this.rootRef;

    while (true) {
      if (nodeRef === undefined) {
        //found correct position, so we insert the node here.
        this._actualInsert(key, value, parentRef, dir);
        break;
      }

      const nodeArray = this.deps.heap.get(nodeRef, Uint32Array);

      const nodeData = this.getNodeDataArrayByRawArray(nodeArray);

      if (this.deps.keyEquals(key, nodeData)) {
        this.deps.setValue(this.getNodeDataArrayByRawArray(nodeArray), value);
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
   * 1. Insert a node it a leave position consistent with sort order.
   * 2. Move up the tree incrementally correcting the red-black properties.
   */
  private _actualInsert = (
    key: K,
    value: V,
    parentRef?: number,
    parentDir?: "left" | "right"
  ) => {
    this.size++;

    //allocate space for new node

    let node = this._allocate(key, value, parentRef);

    //begin insert

    if (parentRef === undefined) {
      this.rootRef = node.ref;
      return;
    }

    let parentArray = this.deps.heap.get(parentRef, Uint32Array);

    this.setChild(parentArray, parentDir!, node.ref);

    // now the red/black properties must be checked.

    while (true) {
      if (parentArray === undefined) {
        throw new Error("Impossible");
      }

      const grandRef = this.getParent(parentArray);

      if (!this.getRed(parentArray)) {
        // Case 1
        //no red-violation.
        //and we have only inserted a red node, so black violation isn't possible either.
        return;
      }

      if (grandRef === undefined) {
        //case 4
        //parent is the root node and is red.
        //we can fix the red-violation by simply changing the parent into black.
        //it increases the length of all black-paths by 1.
        this.setRed(parentArray, false);
        return;
      }

      //find uncle

      const grandArray = this.deps.heap.get(grandRef, Uint32Array);

      const grandParentSide = this.childDirection(parentRef, grandArray);
      const otherGrandParentSide = reverseDirection(grandParentSide);

      const uncleRef = this.getChild(grandArray, otherGrandParentSide);
      const uncleArray =
        uncleRef === undefined
          ? undefined
          : this.deps.heap.get(uncleRef, Uint32Array);

      // case 5/6

      if (!(uncleArray && this.getRed(uncleArray))) {
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

      if (parentRef === undefined) {
        //case 3
        return;
      }

      parentArray = this.deps.heap.get(parentRef, Uint32Array);
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

    this.deps.heap.deallocate(ref);

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

    if (nodeLeft !== undefined && nodeRight !== undefined) {
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
      parentRef === undefined
        ? undefined
        : this.deps.heap.get(parentRef, Uint32Array);

    // no children

    if (nodeLeft === undefined && nodeRight === undefined) {
      if (parentArray === undefined) {
        //it's root, and can simply be removed.
        this.rootRef = undefined;

        return nodeRef;
      }

      if (this.getRed(nodeArray)) {
        //it's red and has no children, so it can simply be removed from parent.

        this.setChild(
          parentArray,
          this.childDirection(nodeRef, parentArray),
          undefined
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
      nodeLeft === undefined
        ? nodeRight !== undefined
        : nodeRight === undefined;

    assert(oneChild === (nodeLeft !== nodeRight));
    assert(oneChild);

    //one child, so node must be black node with red child.

    const childRef = nodeLeft !== undefined ? nodeLeft : nodeRight;

    const childArray = this.deps.heap.get(childRef!, Uint32Array);

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
      this.setParent(childArray, undefined);
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

    let ref = def(this.getRight(sourceArray));
    let array = this.deps.heap.get(ref, Uint32Array);

    while (true) {
      const tmpRef = this.getLeft(array);

      if (tmpRef === undefined) {
        break;
      }

      ref = tmpRef;
      array = this.deps.heap.get(tmpRef, Uint32Array);
    }

    //move key/value data to the source node, because that is preserved in the tree.

    this.deps.setKey(
      this.getNodeDataArrayByRawArray(sourceArray),
      this.deps.getKey(this.getNodeDataArrayByRawArray(array))
    );

    this.deps.setValue(
      this.getNodeDataArrayByRawArray(sourceArray),
      this.deps.getValue(this.getNodeDataArrayByRawArray(array))
    );

    //return a reference to the node that must be deleted.

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

    assert(!this.getRed(nodeArray));

    assert(
      this.getLeft(nodeArray) === undefined &&
        this.getRight(nodeArray) === undefined
    ); //has no children

    // let parent = this.tryGetNodeByRefOld(this.getParent(nodeArray));
    let parentRef = this.getParent(nodeArray);

    if (parentRef === undefined) {
      throw new Error("Parent should be set here.");
    }

    let parentArray = this.deps.heap.get(parentRef, Uint32Array);

    let dir: "left" | "right" = this.childDirection(nodeRef, parentArray);

    // remove the node

    this.setChild(parentArray, dir, undefined);
    // parent[dir] = undefined;

    //loop invariant
    //  node is black and have a parent.
    //  parent has black height one too big on the other branch.

    do {
      //prepare family

      const reverse = reverseDirection(dir);

      const siblingRef = this.getChild(parentArray, reverse);

      if (siblingRef === undefined) {
        throw new Error("Black nodes should always have a sibling."); //otherwise it would be a black-violation
      }

      const siblingArray = this.deps.heap.get(siblingRef, Uint32Array); //child is in the reverse direction of rotation.

      const distantNephewRef = this.getChild(siblingArray, reverse);

      const distantNephewArray =
        distantNephewRef === undefined
          ? undefined
          : this.deps.heap.get(distantNephewRef, Uint32Array);

      const closeNephewRef = this.getChild(siblingArray, dir);

      const closeNephewArray =
        closeNephewRef === undefined
          ? undefined
          : this.deps.heap.get(closeNephewRef, Uint32Array);

      //cases

      if (this.getRed(siblingArray)) {
        // case 3

        this._rotate(parentRef, parentArray, dir);

        // parent.red = true;
        this.setRed(parentArray, true);
        this.setRed(siblingArray, false); //ensure we won't hit this case again, and get progress.

        //continue will hit one of the cases: 4, 5 or 6.

        continue;
      }

      if (distantNephewArray && this.getRed(distantNephewArray)) {
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

      if (closeNephewArray && this.getRed(closeNephewArray)) {
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

      if (this.getRed(parentArray)) {
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

      if (parentRef) {
        //only bother updating, if we continue in the loop
        parentArray = this.deps.heap.get(parentRef, Uint32Array);
        dir = this.childDirection(nodeRef, parentArray);
      }
    } while (parentRef !== undefined);

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
    assert(!this.getRed(siblingArray));

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

    this.setRed(siblingArray, this.getRed(parentArray));
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
    const parentArray = parentRef === undefined ? undefined : this.deps.heap.get(parentRef, Uint32Array); // prettier-ignore

    const nodeDir = parentArray && this.childDirection(nodeRef, parentArray);

    //get child that is rotated up.

    const childRef = this.getChild(nodeArray, reverse);

    if (childRef === undefined) {
      throw err("No child to rotate up.", { nodeRef, direction: reverse });
    }

    const childArray = this.deps.heap.get(childRef, Uint32Array); //child is in the reverse direction of rotation.

    //node gets its inner grandchild as new child, instead of the child which is rotated up.

    const innerGrandchildRef = this.getChild(childArray, dir);

    this.setChild(nodeArray, reverse, innerGrandchildRef);

    if (innerGrandchildRef !== undefined) {
      const innerGrandchildArray = this.deps.heap.get( innerGrandchildRef, Uint32Array ); // prettier-ignore

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
   * The direction that the parent is reached from the parent node.
   *
   * todo: i think all caller already knowns parent, so take a argument.
   */
  private childDirection = (nodeRef: number, parentArray: Uint32Array) =>
    nodeRef === this.getLeft(parentArray) ? "left" : "right";

  /**
   *
   */
  private keyEqualsByRawArray = (a?: Uint32Array, b?: Uint32Array) =>
    this.deps.keyEquals(
      a && this.getNodeDataArrayByRawArray(a),
      b && this.getNodeDataArrayByRawArray(b)
    );

  /**
   *
   */
  private getRed(array: Uint32Array) {
    return array[COLOR_OFFSET] === 1;
  }

  /**
   *
   */
  private setRed(array: Uint32Array, red: boolean) {
    array[COLOR_OFFSET] = red ? 1 : 0;
  }

  /**
   *
   */
  private getParent(array: Uint32Array) {
    const ref = array[PARENT_OFFSET];

    if (ref === UINT32_UNDEFINED) {
      return;
    }

    return ref;
  }

  private setParent(array: Uint32Array, _node: number | undefined) {
    const ref = _node ?? UINT32_UNDEFINED;

    array[PARENT_OFFSET] = ref;
  }

  /**
   *
   */
  private getChild(array: Uint32Array, direction: "left" | "right") {
    return direction === "left" ? this.getLeft(array) : this.getRight(array);
  }

  /**
   *
   */
  private setChild(
    array: Uint32Array,
    direction: "left" | "right",
    _node: number | undefined
  ) {
    direction === "left"
      ? this.setLeft(array, _node)
      : this.setRight(array, _node);
  }

  /**
   *
   */
  private getLeft(array: Uint32Array) {
    const ref = array[LEFT_OFFSET];

    if (ref === UINT32_UNDEFINED) {
      return;
    }

    return ref;
  }

  /**
   *
   */
  private setLeft(array: Uint32Array, _node: number | undefined) {
    const ref = _node ?? UINT32_UNDEFINED;

    array[LEFT_OFFSET] = ref;
  }

  /**
   *
   */
  private getRight(array: Uint32Array) {
    const ref = array[RIGHT_OFFSET];

    if (ref === UINT32_UNDEFINED) {
      return;
    }

    return ref;
  }

  /**
   *
   */
  private setRight(array: Uint32Array, _node: number | undefined) {
    const ref = _node ?? UINT32_UNDEFINED;

    array[RIGHT_OFFSET] = ref;
  }

  /**
   * Allocate a new node, but not attached to the tree, yet.
   */
  public _allocate = (key: K, value: V, parentRef: number | undefined) => {
    const alloc = this.deps.heap.allocate(Uint32Array);

    try {
      //enter data

      this.deps.setKey(this.getNodeDataArrayByRawArray(alloc.array), key); //might throw on bad user input.
      this.deps.setValue(this.getNodeDataArrayByRawArray(alloc.array), value); //ditto
      this.setRed(alloc.array, true); //new nodes are always red
      this.setParent(alloc.array, parentRef);
      this.setLeft(alloc.array, undefined); //needed to set UINT32_UNDEFINED
      this.setRight(alloc.array, undefined); //ditto

      return alloc;
    } catch (error) {
      this.deps.heap.deallocate(alloc.ref);
      throw error;
    }
  };

  /**
   *
   */
  private _invariant = () => {
    let globalBlackCount: number | undefined = undefined;
    const self = this;
    let actualSize = 0;

    helper(0, this.rootRef, undefined);

    assertEq(this.size, actualSize);

    /**
     *  - full dfs traversal.
     */
    function helper(
      blackCount: number,
      nodeRef: number | undefined,
      parentArray: Uint32Array | undefined
    ) {
      if (nodeRef === undefined) {
        //check black node count because it's a leave node.

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

      const nodeArray = self.deps.heap.get(nodeRef, Uint32Array);

      //info

      const nodeRed = self.getRed(nodeArray);
      const parentRed = parentArray && self.getRed(parentArray);

      //check parent key

      const parentRef = self.getParent(nodeArray);

      if (parentArray === undefined) {
        assert(parentRef === undefined);
      } else {
        if (parentRef === undefined) {
          throw new Error("Parent key didn't exist.");
        }

        const actualParentArray = self.deps.heap.get(parentRef, Uint32Array);

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
}

//
// util
//

/**
 *
 */
const reverseDirection = (direction: "left" | "right") =>
  direction === "right" ? "left" : "right";
