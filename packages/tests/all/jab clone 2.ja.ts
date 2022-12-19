import { capture } from "^jab";
import { TestProvision } from "^jarun";

// max depth

export default ({ eq }: TestProvision) => {
  eq(1, capture(1, 0));
  eq(null, capture(null, 0));

  eq(1, capture(1, 1));
  eq(null, capture(null, 1));

  //arrays

  eq(["MaxDepth"], capture([], 0));

  eq(["value", []], capture([], 1));
  eq(["value", [1]], capture([1], 1));
  eq(["value", [1, ["MaxDepth"]]], capture([1, [2]], 1));

  eq(["value", [["value", [1]]]], capture([[1]], 2));
  eq(["value", [1, ["value", [2]]]], capture([1, [2]], 2));
  eq(["value", [1, ["value", [2, ["MaxDepth"]]]]], capture([1, [2, []]], 2));

  //objects

  eq(["MaxDepth"], capture({}, 0));

  eq({}, capture({}, 1));
  eq({ a: 1, b: ["MaxDepth"] }, capture({ a: 1, b: {} }, 1));
};
