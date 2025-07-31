import {
  captureArrayEntries,
  ErrorData,
  makeJabError,
  ParsedStackFrame,
  CapturedStack,
  isNode,
  tryProp,
  Diagnostic,
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
 * Assert that the function throws and match the predicate.
 */
export const assertException = (
  func: () => void,
  predicate: (error: string) => boolean
) => {
  try {
    func();
  } catch (error: any) {
    if (predicate(error.message)) {
      return;
    } else {
      err("Error ditn't match predicate", error);
    }
  }

  throw new Error("Expected exception");
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
 * Convert an error object to structured data.
 *
 */
export const unknownToErrorData = (
  error: any,
  extraInfo: Array<unknown> = []
): ErrorData => {
  try {
    if (tryProp(error, "getErrorData")) {
      return (error as any).getErrorData(extraInfo);
    } else {
      return {
        msg: error.toString(),
        info: captureArrayEntries(extraInfo),
        stack: captureLongStack(error),
      };
    }
  } catch (extraError) {
    //todo: the extraError should also be reported
    const wrapper = makeJabError("Could not clone Error object: ", error);

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

/**
 *
 */
export const mapErrorsForInclusionInJs = (errors: unknown[]) => {
  const quickFixMessage: string[] = [];

  const errorsAsJson = errors.map((error) => {
    const { msg, info, stack } = unknownToErrorData(error);

    quickFixMessage.push(msg);

    return `{msg:${JSON.stringify(msg)}, info:${JSON.stringify(
      info
    )}, stack:${JSON.stringify(stack)}}`;
  });

  const errorsOutput = errorsAsJson.join(",");

  const message = JSON.stringify(
    "RawAggragateError:\n" + quickFixMessage.join("\n")
  );

  return `QUICK_FIX = {message:${message}, getAggregateErrors: () => [${errorsOutput}]}`;
};

/**
 * duplicate between util.js and jab
 *
 *
 */
export const emitVsCodeError = (deps: Diagnostic) => {
  assert(!deps.file.includes("\n"));

  assert(
    typeof deps.message === "string" && !deps.message.includes("\n"),
    "message"
  );
  assert(deps.line === undefined || typeof deps.line === "number");
  assert(deps.column === undefined || typeof deps.column === "number");
  assert(
    deps.severity === undefined ||
      (typeof deps.severity === "string" && !deps.severity.includes("\n"))
  );

  const line = deps.line ?? 1;
  const column = deps.column ?? 1;
  const severity = deps.severity ?? "error";

  console.log( deps.message + " - " + severity + " - " + deps.file + ":" + line + ":" + column ); // prettier-ignore
};
