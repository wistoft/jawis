import { cloneArrayEntries, ErrorData, JabError } from ".";

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
      stack: error.stack,
    };
  } else {
    const wrapper = new JabError("Unknown Error object: ", error);

    return wrapper.getErrorData(extraInfo);
  }
};
