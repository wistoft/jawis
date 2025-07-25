import { err, numberOfRightZeroBits, preserveHeighestBit } from "^jab";

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
