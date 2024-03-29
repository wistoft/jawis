import {
  captureArrayEntries,
  ErrorData,
  makeJabError,
  ParsedStackFrame,
  CapturedStack,
  isNode,
  tryProp,
} from "./internal";

/**
 *
 */
export const err = (msg: string, ...args: Array<unknown>): never => {
  throw makeJabError(msg, ...args);
};

/**
 *
 */
export const pres = <T>(value: T) => Promise.resolve(value);

/**
 *
 */
export const prej = (msg: string, ...args: Array<unknown>) =>
  Promise.reject(makeJabError(msg, ...args));

/**
 *
 */
export const assert = (
  val: boolean | undefined,
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
export const assertEq = (
  val1: any,
  val2: any,
  msg = "Assert failed.",
  ...args: Array<unknown>
) => {
  if (val1 === val2) {
    return;
  }

  err(msg, val1, val2, ...args);
};

/**
 *
 */
export const captureLongStack = (error: {
  stack?: string;
  __jawisNodeStack?: ParsedStackFrame[];
  getAncestorStackFrames?: () => CapturedStack;
}): CapturedStack => {
  const own = captureStack(error);

  // get ancestor frames

  if (own.type !== "parsed") {
    //can't be combine with ancestor frames, if not parsed.
    return own;
  }

  let ancestorFrames: ParsedStackFrame[] = [];

  if (error.getAncestorStackFrames) {
    const stack = error.getAncestorStackFrames();

    //node-parsed for for backwards compat
    if (stack.type !== "parsed" && (stack as any).type !== "node-parsed") {
      throw new Error("only implemented for jacs.");
    }

    ancestorFrames = stack.stack as ParsedStackFrame[];
  }

  //combine

  return {
    type: "parsed",
    stack: [...own.stack, ...ancestorFrames],
  };
};

/**
 *
 */
export const captureStack = (error: {
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
      type: "parsed",
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
  } else if (error instanceof Error) {
    return {
      msg: error.toString(),
      info: captureArrayEntries(extraInfo),
      stack: captureLongStack(error),
    };
  } else {
    const wrapper = makeJabError("Unknown Error object: ", error);

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
      type: "parsed",
      stack: [{ file, line }],
    },
  }),
});
