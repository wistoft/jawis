import { assert } from "^jab";

type LcsResult = { leftIdx: number; rightIdx: number; length: number } | null;

/**
 *
 * note
 *  not correct implementation. It may not be the _largest_ common substring.
 *   But close I think. For most cases, probably.
 *
 * impl
 *  - half the right string until it matches something in the left.
 *  - Then expands to include things match before and after the match.
 */
export const longestCommonSubstring = (a: string, b: string) =>
  lcsCore(a, b, b.length);

/**
 *
 */
export const lcsCore = (
  left: string,
  right: string,
  chunkSize: number
): LcsResult => {
  //
  //check if chunks can be found in the string
  //

  let leftIdx: number | null = null;
  let rightIdx: number | null = null;
  let length: number | null = null;

  for (let i = 0; i < right.length; i += chunkSize) {
    if (i + chunkSize > right.length) {
      //not meaningful to check smaller chunks than `chunkSize`. I.e. the last chunk.
      break;
    }

    const chunk = right.slice(i, i + chunkSize);

    assert(chunk.length === chunkSize);

    const protoLeftIdx = left.indexOf(chunk);

    if (protoLeftIdx >= 0) {
      //expand left

      let a = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (protoLeftIdx - a - 1 < 0) {
          break;
        }

        if (i - a - 1 < 0) {
          break;
        }

        if (left[protoLeftIdx - a - 1] !== right[i - a - 1]) {
          break;
        }

        a++;
      }

      //expand right

      let b = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (protoLeftIdx + chunk.length + b >= left.length) {
          break;
        }

        if (i + chunk.length + b >= right.length) {
          break;
        }

        if (
          left[protoLeftIdx + chunk.length + b] !== right[i + chunk.length + b]
        ) {
          break;
        }

        b++;
      }

      //save

      if (length === null || chunk.length + a + b > length) {
        leftIdx = protoLeftIdx - a;
        rightIdx = i - a;
        length = chunk.length + a + b;
      }
    }
  }

  //return if something found.

  if (leftIdx !== null && rightIdx !== null && length !== null) {
    return {
      leftIdx,
      rightIdx,
      length,
    };
  }

  //
  // termination
  //

  if (chunkSize <= 1) {
    //nothing matches.
    return null;
  }

  //
  // no match found so half the chunks.
  //

  return lcsCore(left, right, Math.floor(chunkSize / 2));
};
