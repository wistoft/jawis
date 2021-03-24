import { longestCommonSubstring } from "^jawis-util/algs";
import { TestProvision } from "^jarun";

export default ({ eq }: TestProvision) => {
  eq(null, longestCommonSubstring("", ""));

  eq(null, longestCommonSubstring("", "1"));
  eq(null, longestCommonSubstring("", "12"));
  eq(null, longestCommonSubstring("", "123"));
  eq(null, longestCommonSubstring("", "12345"));

  //
  // a
  //

  eq(null, longestCommonSubstring("a", ""));
  eq(null, longestCommonSubstring("a", "b"));
  eq({ leftIdx: 0, rightIdx: 0, length: 1 }, longestCommonSubstring("a", "a"));
  eq({ leftIdx: 0, rightIdx: 0, length: 1 }, longestCommonSubstring("a", "aa"));
  eq({ leftIdx: 0, rightIdx: 0, length: 1 }, longestCommonSubstring("a", "ab"));

  //
  // ab
  //

  eq(null, longestCommonSubstring("ab", ""));
  eq(null, longestCommonSubstring("ab", "12"));
  eq({ leftIdx: 0, rightIdx: 0, length: 1 }, longestCommonSubstring("ab", "a"));
  eq({ leftIdx: 1, rightIdx: 0, length: 1 }, longestCommonSubstring("ab", "b"));
  eq({ leftIdx: 0, rightIdx: 0, length: 2 }, longestCommonSubstring("ab", "ab")); // prettier-ignore
  eq({ leftIdx: 0, rightIdx: 0, length: 1 }, longestCommonSubstring("ab", "ax")); // prettier-ignore
  eq({ leftIdx: 1, rightIdx: 0, length: 1 }, longestCommonSubstring("ab", "ba")); // prettier-ignore
  eq({ leftIdx: 1, rightIdx: 1, length: 1 }, longestCommonSubstring("ab", "xb")); // prettier-ignore

  //
  // abc
  //

  eq(null, longestCommonSubstring("abc", ""));
  eq(null, longestCommonSubstring("abc", "123"));
  eq({ leftIdx: 0, rightIdx: 1, length: 3 }, longestCommonSubstring("abc", "xabc")); // prettier-ignore
  eq({ leftIdx: 0, rightIdx: 0, length: 3 }, longestCommonSubstring("abc", "abcx")); // prettier-ignore
  eq({ leftIdx: 0, rightIdx: 1, length: 2 }, longestCommonSubstring("bba", "abb")); // prettier-ignore

  //
  // more
  //

  eq({ leftIdx: 1, rightIdx: 0, length: 2 }, longestCommonSubstring("baa", "aaaaaab")); // prettier-ignore
};
