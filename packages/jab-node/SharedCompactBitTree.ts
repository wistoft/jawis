import {
  assert,
  assertEq,
  err,
  numberOfRightZeroBits,
  preserveHeighestBit,
} from "^jab";

import { SharedValidityVector } from "./SharedValidityVector";

export type SharedCompactBitTreeDeps = {
  maxSize: number;
  dataSize: number;
  byteSize: number; //must be consistent with maxSize and dataSize.
  sharedArray: Int32Array;
  unpack?: boolean; //default is initialize the shared array. (default: false)
};

const CHUNK_COUNT_OFFSET = 0; //number of allocated chunks.

const NODE_COUNT_OFFSET = CHUNK_COUNT_OFFSET + 1; //the length of the tree.

const META_DATA_LENGTH = NODE_COUNT_OFFSET + 1;

//trouble, if not multiple of 8.
const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 * Left-compact tree.
 *
 * - The tree is laid out sequentially in memory.
 *    - With a fixed left endpoint, and a dynamic right endpoint for adding/removing nodes.
 *    - Nodes can't be inserted/deleted in the middle of the tree.
 * - Each node contains valid bits, to indicate whether data chunks stored in the node are valid.
 * - The user can interpret the data in any way, the only restrictions are:
 *    - Data chunks must be valid, when deallocated.
 *    - Allocate finds an invalid chunk, makes i valid, and returns it.
 *
 * notes
 *  - Maintains a tree with a full subtree on the left hand-side.
 *    - More precisely: All subtrees reachable by at least one left edge are perfect.
 *  - Nodes are zero-indexed.
 *  - Nodes are are always added/removed from the right end.
 *  - Edges are virtual.
 *      - Links can be determined from the bit-representation of node-index.
 *
 * memory layout
 *  - meta data
 *  - nodes (repeated)
 *      2  uint32   free-bit-boolean. If left/right subtree has any valid bits it's 1, otherwise 0.
 *      64 bits     valid-bits
 *      n  bytes    space for chunks. For external use.
 *
 * structure of reference (heighest bits first)
 *   27 bits   node index
 *   1  bit    chunk index
 *   4  bits   chunk version
 *
 * todo
 *  - make exclusive lock
 *  - nodeCount isn't decreased. But it the heighest unused nodes could be removed, if user's want to reclaim place.
 */
export class SharedCompactBitTree {
  private maxNodes: number;
  private nodeByteLength: number;

  private static FREE_BIT_BYTE_SIZE = 8;
  private static VALIDITY_VECTOR_BYTE_SIZE = 8;
  private static VALIDITY_VECTOR_BYTE_OFFSET = 8;

  private static NODE_HEADER_BYTE_SIZE = SharedCompactBitTree.FREE_BIT_BYTE_SIZE + SharedCompactBitTree.VALIDITY_VECTOR_BYTE_SIZE; // prettier-ignore
  private static DATA_OVERHEAD = 8;
  private static DATA_COUNT_PER_NODE = 2;

  /**
   *
   */
  constructor(public deps: SharedCompactBitTreeDeps) {
    assert(this.deps.maxSize > 0, "Size must be positive: " + this.deps.maxSize); // prettier-ignore

    const expected = SharedCompactBitTree.getExpectedBytesize(this.deps.maxSize, this.deps.dataSize); // prettier-ignore

    if (this.deps.byteSize !== expected) {
      err("byteSize should be: " + expected + ", was:" + this.deps.byteSize); // prettier-ignore
    }

    //derived

    this.maxNodes = Math.ceil(this.deps.maxSize / SharedCompactBitTree.DATA_COUNT_PER_NODE); // prettier-ignore

    this.nodeByteLength =
      SharedCompactBitTree.NODE_HEADER_BYTE_SIZE +
      SharedCompactBitTree.DATA_COUNT_PER_NODE * this.deps.dataSize;

    //state

    if (!deps.unpack) {
      this.deps.sharedArray[CHUNK_COUNT_OFFSET] = 0;
      this.deps.sharedArray[NODE_COUNT_OFFSET] = 1;
    }
  }

  /**
   *
   */
  public static getExpectedBytesize = (n: number, dataByteSize: number) => {
    const headerCount = Math.ceil(
      (n * SharedCompactBitTree.DATA_OVERHEAD) /
        SharedCompactBitTree.NODE_HEADER_BYTE_SIZE
    );

    const headerBytes =
      headerCount * SharedCompactBitTree.NODE_HEADER_BYTE_SIZE;

    return META_DATA_BYTES + headerBytes + n * dataByteSize;
  };

  /**
   *
   */
  get count() {
    return this.deps.sharedArray[CHUNK_COUNT_OFFSET];
  }

  /**
   *
   */
  public getDataIndex = (ref: number) => {
    const { nodeIndex, chunkIndex } = this.decode(ref);

    const baseIndex = META_DATA_BYTES + nodeIndex * this.nodeByteLength + SharedCompactBitTree.NODE_HEADER_BYTE_SIZE; // prettier-ignore

    return baseIndex + chunkIndex * this.deps.dataSize;
  };

  /**
   *
   */
  public allocate = () => {
    const index = this.tryAllocate();

    if (index === undefined) {
      throw new Error("Not enough space, max: " + this.deps.maxSize); // prettier-ignore
    }

    this.deps.sharedArray[CHUNK_COUNT_OFFSET]++;

    return index;
  };

  /**
   *
   *  - Increases the data structure if it's needed. And if the allotted space allows it.
   *
   * impl
   *  - The left subnode of the added node will always be full. Either it's a leave node. Or it's
   *      a inner node and the left sub node is filled, because we only add nodes, when we run out of space.
   *  - Note: The inserted node is the right most in the tree, because it's the largest node. Hence it's reachable
   *      via only right edges. Otherwise a ancestor would be to the right it.
   *  - The nodes that will have free-bits below them after insertion, are the nodes from the root to the
   *      inserted node. I.e. the nodes reachable from the root by following right edges.
   *  - Note the inserted node shouldn't have a free-bits set true for right subtree, but the `_tryGet` will have same
   *      semantics. It will just try to recurse and set free-bits to false.
   */
  public tryAllocate = () => {
    const index = this._tryAllocate(_getRoot(this.deps.sharedArray[NODE_COUNT_OFFSET])); // prettier-ignore

    if (index !== undefined) {
      return index;
    }

    //it's was out of space

    if (this.deps.sharedArray[NODE_COUNT_OFFSET] < this.maxNodes) {
      // we can increase nodes.

      this.deps.sharedArray[NODE_COUNT_OFFSET]++;
      const cachedNodeCount = this.deps.sharedArray[NODE_COUNT_OFFSET];

      //set free-bit-boolean from root-node (possibly new) to all transitive right nodes.

      let nodeIndex: number | undefined = _getRoot(cachedNodeCount);

      do {
        const freeBitArray = this.getFreeBitArray(nodeIndex);

        freeBitArray[1] = 1;
      } while ((nodeIndex = _rightNode(nodeIndex, cachedNodeCount)));

      // now there should be something

      const newIndex = this._tryAllocate(_getRoot(cachedNodeCount));

      assert(newIndex !== undefined, "Impossible");

      return newIndex;
    }

    //out of space, and can't expand.
  };

  /**
   *
   */
  private _tryAllocate = (nodeIndex: number): number | undefined => {
    if (nodeIndex + 1 > this.deps.sharedArray[NODE_COUNT_OFFSET]) {
      throw new Error("Impossible");
    }

    const freeBitArray = this.getFreeBitArray(nodeIndex);

    //left nodes

    if (freeBitArray[0] === 1) {
      const left = _leftNode(nodeIndex);

      if (left !== undefined) {
        const index = this._tryAllocate(left);

        if (index !== undefined) {
          return index;
        }
      }

      //left sub tree is filled now.

      freeBitArray[0] = 0;

      //continue to search in own and right subnodes.
    }

    // own node

    const chunk = this.getValidityVector(nodeIndex).tryGet();

    if (chunk !== undefined) {
      const { index, ref } = this.encode(nodeIndex, chunk.index, chunk.version);

      if (index >= this.deps.maxSize) {
        //index was found in this node, but the size limit is reach within this exact node.
        return;
      } else {
        //found in own node
        return ref;
      }
    }

    //right nodes

    if (freeBitArray[1] === 1) {
      const right = _rightNode(
        nodeIndex,
        this.deps.sharedArray[NODE_COUNT_OFFSET]
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
    const { nodeIndex, chunkIndex, version } = this.decode(ref);

    this.deps.sharedArray[CHUNK_COUNT_OFFSET]--;

    this._deallocate(
      ref,
      nodeIndex,
      chunkIndex,
      version,
      _getRoot(this.deps.sharedArray[NODE_COUNT_OFFSET])
    );
  };

  /**
   *
   * impl
   *  - sets the node 'statistics' on the way up. Because the are user input, that cause a throw,
   *    in which case it would be corrupt to change the tree.
   *  - Might actually not be a semantic problem, because `tryGet` will just perform the search,
   *    and then set the node 'statistics' correctly again.
   */
  private _deallocate = (
    ref: number,
    nodeIndex: number,
    chunkIndex: number,
    version: number,
    curNodeIndex?: number
  ) => {
    if (curNodeIndex === undefined) {
      throw new Error("Reference out of range: " + ref);
    }

    const freeBitArray = this.getFreeBitArray(curNodeIndex);

    //left

    if (nodeIndex < curNodeIndex) {
      this._deallocate(
        ref,
        nodeIndex,
        chunkIndex,
        version,
        _leftNode(curNodeIndex)
      );

      freeBitArray[0] = 1;

      return;
    }

    //own

    if (nodeIndex < curNodeIndex + 1) {
      this.getValidityVector(curNodeIndex).invalidate(chunkIndex, version);

      return;
    }

    //right

    this._deallocate(ref, nodeIndex, chunkIndex, version, _rightNode(curNodeIndex, this.deps.sharedArray[NODE_COUNT_OFFSET])); // prettier-ignore

    freeBitArray[1] = 1;
  };

  /**
   *
   */
  private encode = (nodeIndex: number, chunkIndex: number, version: number) => {
    if (chunkIndex > 1) {
      throw new Error("not impl");
    }

    if (version > 15) {
      throw new Error("Version too heigh");
    }

    const baseIndex = nodeIndex * SharedCompactBitTree.DATA_COUNT_PER_NODE;

    const index = baseIndex + chunkIndex;

    return { index, ref: version + (index << 4) };
  };

  /**
   *
   * - We can calculate the base index for any node, because nodes are laid out linearly in memory.
   */
  private decode = (ref: number) => {
    const version = ref & 0xf;

    assert(version !== 0, "Reference isn't valid: ", { ref, version });

    const index = ref >>> 4;

    const nodeIndex = Math.floor( index / SharedCompactBitTree.DATA_COUNT_PER_NODE ); // prettier-ignore

    if (
      nodeIndex < 0 ||
      nodeIndex >= this.deps.sharedArray[NODE_COUNT_OFFSET]
    ) {
      err("Reference isn't valid: ", { ref, nodeIndex });
    }

    const baseIndex = nodeIndex * SharedCompactBitTree.DATA_COUNT_PER_NODE;

    const chunkIndex = index - baseIndex;

    const bitVector = this.getValidityVector(nodeIndex);

    assert(bitVector.isValid(chunkIndex, version), "Reference isn't valid: ", {
      ref,
      index,
      nodeIndex,
      chunkIndex,
      version,
    });

    return { nodeIndex, chunkIndex, version };
  };

  /**
   *
   */
  private getFreeBitArray = (nodeIndex: number) => {
    const freeBitOffset =
      META_DATA_BYTES / 4 + (nodeIndex * this.nodeByteLength) / 4;

    const array = this.deps.sharedArray.subarray(freeBitOffset, freeBitOffset + SharedCompactBitTree.FREE_BIT_BYTE_SIZE / 4); // prettier-ignore

    assert(array.length === 2, undefined, { freeBitArray: array, node: nodeIndex, sharedArray: this.deps.sharedArray, nodeOffset: freeBitOffset, }); // prettier-ignore

    return array;
  };

  /**
   *
   */
  private getValidityVector = (nodeIndex: number) => {
    const freeBitOffset =
      META_DATA_BYTES / 4 + (nodeIndex * this.nodeByteLength) / 4;
    const validityVectorOffset = freeBitOffset + SharedCompactBitTree.VALIDITY_VECTOR_BYTE_OFFSET / 4; // prettier-ignore

    const array = this.deps.sharedArray.subarray(validityVectorOffset, validityVectorOffset +  SharedCompactBitTree.VALIDITY_VECTOR_BYTE_SIZE / 4); // prettier-ignore

    assert(array.length === 2, undefined, { bitArray: array });

    return new SharedValidityVector({
      size: SharedCompactBitTree.VALIDITY_VECTOR_BYTE_SIZE / 4,
      sharedArray: array,
    });
  };
}

//
// util
//

/**
 * Get the left subnode.
 *
 *  - Returns false when there's no left subnode.
 *
 * notes
 *  - It's possible to determine the jump length from the node index.
 *  - The left subtree is always full, so it only depends on the jumplength.
 *
 */
export const _leftNode = (nodeIndex: number) => {
  const jumpLength = _getJumpLength(nodeIndex);

  //the bottom leaves never have a left subnode.

  if (jumpLength === 0) {
    return;
  }

  //the left subtree is always full, so the

  return nodeIndex - jumpLength;
};

/**
 * Get the right subnode.
 *
 *  - Returns null when there's no left subnode.
 *  - The JumpLength paremeter is only for double checking.
 *
 *
 * notes
 *  - It's possible to determine the size of the right subtree.
 *  - If it's full it's simple to determine the right subnode. But if it's partial full
 *      the right subnode depends of the size of the right subtree.
 *  - The right subtree is full if the there is enough nodes in the data structure to fill
 *      it up. That's why the size of the data structure is enough to determine its size.
 */
export const _rightNode = (nodeIndex: number, nodeCount: number) => {
  if (nodeIndex > nodeCount) {
    err("Index can't be larger than size.", { node: nodeIndex, nodeCount });
  }

  const maxJumpLength = _getJumpLength(nodeIndex);

  //the bottom leaves never have a right subnode.

  if (maxJumpLength === 0) {
    return;
  }

  //Prevent `_getRoot` from throwing for this case.

  if (nodeIndex + 1 === nodeCount) {
    return;
  }

  //given the size of the right subtree, we can determine which node is root thereof.
  // That will be the right subnode.

  let actualJump = _getRoot(nodeCount - nodeIndex - 1) + 1;

  //correction when right subtree is full.

  if (actualJump > maxJumpLength) {
    actualJump = maxJumpLength;
  }

  return nodeIndex + actualJump;
};

/**
 *
 */
export const _getRoot = (nodeCount: number) => {
  if (nodeCount <= 0) {
    err("NodeCount must be positive, was: " + nodeCount);
  }

  return preserveHeighestBit(nodeCount) - 1;
};

/**
 * Get jump length of the given node. Assuming the subtree is full.
 */
export const _getJumpLength = (nodeIndex: number) => {
  if (nodeIndex < 0) {
    err("Index must be non-negative, was: " + nodeIndex);
  }

  const n = numberOfRightZeroBits(nodeIndex + 1);

  return n === 0 ? 0 : 1 << (n - 1);
};
