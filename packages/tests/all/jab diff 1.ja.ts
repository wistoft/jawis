import { TestProvision } from "^jarun";

import { diff_test } from "../_fixture";

export default ({ eq }: TestProvision) => {
  eq([], diff_test("", ""));
  eq([["ins", "a"]], diff_test("", "a"));
  eq([["ins", "ab"]], diff_test("", "ab"));
  eq([["ins", "abc"]], diff_test("", "abc"));

  //
  //a
  //

  eq(["a"], diff_test("a", "a"));
  eq([["del", "a"], ["ins", "b"]], diff_test("a", "b")); // prettier-ignore

  eq(["a", ["ins", "b"]], diff_test("a", "ab"));
  eq([["ins", "b"], "a"], diff_test("a", "ba"));
  eq([["del", "a"], ["ins", "bc"]], diff_test("a", "bc")); // prettier-ignore

  eq(["a", ["ins", "bc"]], diff_test("a", "abc"));
  eq([["ins", "x"], "a", ["ins", "b"]], diff_test("a", "xab"));
  eq([["ins", "xy"], "a"], diff_test("a", "xya"));

  //
  // ab
  //

  eq([["del", "ab"]], diff_test("ab", ""));
  eq(["a", ["del", "b"]], diff_test("ab", "a"));
  eq([["del", "a"], "b"], diff_test("ab", "b"));

  eq(["ab"], diff_test("ab", "ab"));

  eq(["ab", ["ins", "c"]], diff_test("ab", "abc"));
};
