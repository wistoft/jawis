import { ErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { errLogDiff } from "^jatev/util";

const hejError: ErrorData = {
  msg: "hej",
  info: [],
  stack: { type: "node", stack: "dummy" },
};

const davError: ErrorData = {
  msg: "dav",
  info: [],
  stack: { type: "node", stack: "dummy" },
};

export default ({ eq }: TestProvision) => {
  //
  // []
  //

  eq([], errLogDiff([], []));
  eq([["ins", hejError]], errLogDiff([], [hejError]));

  //
  // ["hej"]
  //

  eq([["del", "hej"]], errLogDiff(["hej"], []));
  eq([["eq", hejError]], errLogDiff(["hej"], [hejError]));
  eq([["del", "hej"], ["ins", davError]], errLogDiff(["hej"], [davError])); // prettier-ignore
};
