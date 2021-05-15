import { longestCommonSubstring } from ".";

type DiffResult = Array<["ins", string] | string | ["del", string]>;

/**
 *
 *
 */
export const diff = (left: string, right: string, minSize = 3): DiffResult => {
  //
  //base case
  //

  if (right.length === 0) {
    if (left === "") {
      return [];
    } else {
      return [["del", left]];
    }
  } else {
    if (left === "") {
      return [["ins", right]];
    }
  }

  //
  // recurse
  //

  const matchResult = longestCommonSubstring(left, right);

  if (matchResult === null) {
    //no match, so can only do this:
    return [
      ["del", left],
      ["ins", right],
    ];
  }

  const { leftIdx, rightIdx, length } = matchResult;

  //recurse on string before match

  const preStr = left.slice(0, leftIdx);
  const preRes = diff(preStr, right.slice(0, rightIdx), minSize);

  //recurse on string after match

  const postStr = left.slice(leftIdx + length);
  const postRes = diff(postStr, right.slice(rightIdx + length), minSize);

  //string that match

  const matchStr = left.slice(leftIdx, leftIdx + length);

  //return

  return [...preRes, matchStr, ...postRes];
};
