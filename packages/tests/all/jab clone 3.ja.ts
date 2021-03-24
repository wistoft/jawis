import { clone } from "^jab";
import { TestProvision } from "^jarun";

// annoying values

export default ({ eq }: TestProvision) => {
  //
  // big int
  //

  eq(1212121212121212, clone(1212121212121212));
  eq(121212121212121212, clone(121212121212121212)); //not sure this works, but they are wrong in the same way :-)

  eq(["bigint", "1212121212121212"], clone(BigInt(1212121212121212)));
  // doesn't work for current ES target
  // eq(["bigint", "121212121212121212"], clone(BigInt(121212121212121212)));

  //
  // set
  //

  eq(["set", ["value", []]], clone(new Set([])));
  eq(["set", ["value", [1, 2]]], clone(new Set([1, 2])));
  eq(["set", ["value", [1, ["undefined"], ["value", []]]]], clone(new Set([1, undefined, []]))); // prettier-ignore

  //
  // map
  //

  eq(["map", ["value", []]], clone(new Map([])));

  //
  // functions
  //

  eq(["function", "anonymous"], clone(() => {})); // prettier-ignore
  eq(["function", "anonymous"], clone(() => 1)); // prettier-ignore
  eq(["function", "sayHi"], clone(function sayHi() {})); // prettier-ignore
  eq(
    ["function", "sayHi"],
    clone(function sayHi() {
      // my comment
      return "hi";
    })
  );

  //
  // special classes
  //

  eq(["date", "1970-01-01T00:00:00.000Z"], clone(new Date(0))); // prettier-ignore

  eq(
    [
      "object",
      {
        protoChain: ["Error", "Object"],
        toStringValue: "Error: argh",
        fields: {},
      },
    ],
    clone(new Error("argh"))
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
    clone(/regex/)
  );
};
