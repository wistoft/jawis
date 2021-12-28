import {
  cloneArrayEntries,
  ErrorData,
  JabError,
  ParsedStackFrame,
  CapturedStack,
  tryProp,
  isInstanceOf,
} from ".";

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
export const pres = <T>(value: T) => Promise.resolve(value);

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
  getAncestorStackFrames?: () => CapturedStack;
}): CapturedStack => {
  const own = captureOwnStack(error);

  // get ancestor frames

  if (own.type !== "node-parsed") {
    //this case isn't implemented for ancestors.
    return own;
  }

  let ancestorFrames: ParsedStackFrame[] = [];

  if (error.getAncestorStackFrames) {
    const stack = error.getAncestorStackFrames();

    if (stack.type !== "node-parsed") {
      throw new Error("only implemented for jacs.");
    }

    ancestorFrames = stack.stack;
  }

  //combine

  return {
    type: "node-parsed",
    stack: [...own.stack, ...ancestorFrames],
  };
};

/**
 *
 */
export const captureOwnStack = (error: {
  stack?: string;
  __jawisNodeStack?: ParsedStackFrame[];
}): CapturedStack => {
  //ensure `Error.prepareStackTrace` is executed by accessing `error.stack`

  if (error.stack === undefined) {
    return {
      type: "other",
      stack: "",
    };
  }

  //now `error.__jawisNodeStack` is ensured to be set, if it's going to be.

  if (error.__jawisNodeStack !== undefined) {
    return {
      type: "node-parsed",
      stack: error.__jawisNodeStack,
    };
  } else {
    return {
      type: isNode() ? "node" : "other",
      stack: error.stack,
    };
  }
};

/**
 * Convert an error object til structured data.
 *
 */
export const unknownToErrorData = (
  error: unknown,
  extraInfo: Array<unknown> = []
): ErrorData => {
  if (tryProp(error, "getErrorData")) {
    return (error as any).getErrorData(extraInfo);
  } else if (isInstanceOf(error, Error)) {
    //using `instanceof` would be a problem, if Error is monkey patched, an instances of original Error is processed.
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

/**
 * we could also set a synthetic stack property, but not needed in jawis.
 */
export const getSyntheticError = (
  msg: string,
  file?: string,
  line?: number
) => ({
  message: msg,
  getErrorData: (): ErrorData => ({
    msg: msg,
    info: [],
    stack: {
      type: "node-parsed",
      stack: [{ file, line }],
    },
  }),
});
