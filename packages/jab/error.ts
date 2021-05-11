import { cloneArrayEntries, ErrorData, JabError } from ".";
import { ParsedStackFrame, UnparsedStack } from "./types";
import { isNode } from "./util";

/**
 *
 */
export const err = (msg: string, ...args: Array<unknown>) => {
  throw new JabError(msg, ...args);
};

/**
 *
 */
export const prej = (msg: string, ...args: Array<unknown>) =>
  Promise.reject(new JabError(msg, ...args));

/**
 *
 */
export const assert = (
  val: boolean,
  msg = "Assert failed.",
  ...args: Array<unknown>
) => {
  if (val) {
    return;
  }

  err(msg, ...args);
};

/**
 *
 */
export const captureStack = (error: {
  stack?: string;
  __jawisNodeStack?: ParsedStackFrame[];
}): UnparsedStack => {
  //ensure `Error.prepareStackTrace` is by accessing `error.stack`

  if (error.stack === undefined) {
    return {
      type: "other",
      stack: "",
    };
  }

  //now `error.__jawisNodeStack` is ensured to be set, if it's going to be.

  // if (error.__jawisNodeStack !== undefined) {
  //   return {
  //     type: "node-parsed",
  //     stack: error.__jawisNodeStack,
  //   };
  // } else
  {
    return {
      type: isNode() ? "node" : "other",
      stack: error.stack,
    };
  }
};

/**
 * Consistent way to convert an error object til structured data.
 *
 * todo
 *  - dont rely on class instances. have a
 */
export const unknownToErrorData = (
  error: unknown,
  extraInfo: Array<unknown> = []
): ErrorData => {
  if (error instanceof JabError) {
    return error.getErrorData(extraInfo);
  } else if (
    //use tryUProp
    typeof error === "object" &&
    error !== null &&
    "getErrorData" in error
  ) {
    // quick fix, when jarun is run from another node_modules. Because then JabError
    // is two different class "instances"
    const any: any = error;
    return any.getErrorData(extraInfo);
  } else if (error instanceof Error) {
    return {
      msg: error.toString(),
      info: cloneArrayEntries(extraInfo),
      stack: captureStack(error),
    };
  } else {
    const wrapper = new JabError("Unknown Error object: ", error);

    return wrapper.getErrorData(extraInfo);
  }
};
