import { capture } from "^jab";
import { TestProvision } from "^jarun";

// annoying values

export default ({ eq }: TestProvision) => {
  //
  // big int
  //

  eq(1212121212121212, capture(1212121212121212));
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  eq(121212121212121212, capture(121212121212121212)); //not sure this works, but they are wrong in the same way :-)

  eq(["bigint", "1212121212121212"], capture(BigInt(1212121212121212)));
  // doesn't work for current ES target
  // eq(["bigint", "121212121212121212"], clone(BigInt(121212121212121212)));

  //
  // set
  //

  eq(["set", ["value", []]], capture(new Set([])));
  eq(["set", ["value", [1, 2]]], capture(new Set([1, 2])));
  eq(["set", ["value", [1, ["undefined"], ["value", []]]]], capture(new Set([1, undefined, []]))); // prettier-ignore

  //
  // map
  //

  eq(["map", ["value", []]], capture(new Map([])));

  //
  // functions
  //

  eq(["function", "anonymous"], capture(() => {})); // prettier-ignore
  eq(["function", "anonymous"], capture(() => 1)); // prettier-ignore
  eq(["function", "sayHi"], capture(function sayHi() {})); // prettier-ignore
  eq(
    ["function", "sayHi"],
    capture(function sayHi() {
      // my comment
      return "hi";
    })
  );

  //
  // special classes
  //

  eq(["date", "1970-01-01T00:00:00.000Z"], capture(new Date(0))); // prettier-ignore

  eq(
    [
      "object",
      {
        protoChain: ["Error", "Object"],
        toStringValue: "Error: argh",
        fields: {},
      },
    ],
    capture(new Error("argh"))
  );

  eq(
    [
      "object",
      {
        protoChain: ["RegExp", "Object"],
        toStringValue: "/regex/",
        fields: {},
      },
    ],
    capture(/regex/)
  );
};
