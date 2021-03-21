import { clone } from "^jab";
import { TestProvision } from "^jarun";

// max depth

export default ({ eq }: TestProvision) => {
  eq(1, clone(1, 0));
  eq(null, clone(null, 0));

  eq(1, clone(1, 1));
  eq(null, clone(null, 1));

  //arrays

  eq(["MaxDepth"], clone([], 0));

  eq(["value", []], clone([], 1));
  eq(["value", [1]], clone([1], 1));
  eq(["value", [1, ["MaxDepth"]]], clone([1, [2]], 1));

  eq(["value", [["value", [1]]]], clone([[1]], 2));
  eq(["value", [1, ["value", [2]]]], clone([1, [2]], 2));
  eq(["value", [1, ["value", [2, ["MaxDepth"]]]]], clone([1, [2, []]], 2));

  //objects

  eq(["MaxDepth"], clone({}, 0));

  eq({}, clone({}, 1));
  eq({ a: 1, b: ["MaxDepth"] }, clone({ a: 1, b: {} }, 1));
};
