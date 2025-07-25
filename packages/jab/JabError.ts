import {
  captureArrayEntries,
  capturedTos,
  captureLongStack,
  ErrorData,
} from "./internal";

/**
 * An replacement for Error, that supports capturing variable with the error message.
 *
 * impl
 *  - Can't extend Error, because that makes it impossible to monkey-patch Error. Because the
 *      import order would be critical: monkey patch must happen before extension. But monkey patching
 *      at load is an anti-pattern. Module load should be pure.
 */
export const makeJabError = (message: string, ...info: Array<unknown>) => {
  type JabError = Error & {
    reset: (message: string, ...info: Array<unknown>) => void;
    getErrorData: (extraInfo?: Array<unknown>) => ErrorData;
  };

  //prepare message

  const state = { message, ...safeCloneInfo(message, info) };

  // make the Error return a reasonable message, if it's used as ordinary Error.

  const error = new Error(state.rawMessage) as JabError;

  /**
   * Change the message associated with this error object.
   *
   * - This will not update the message in the stack. But that should never be a problem, as that's "junk" data, anyway.
   */
  const reset = (message: string, ...info: Array<unknown>): void => {
    const { clonedInfo, rawMessage } = safeCloneInfo(message, info);

    state.message = message;
    state.clonedInfo = clonedInfo;
    state.rawMessage = rawMessage;
  };

  /**
   * Return the error message, cloned info and the stack, with information about how to parse it.
   */
  const getErrorData = (extraInfo: Array<unknown> = []) => ({
    msg: state.message,
    info: [...state.clonedInfo, ...captureArrayEntries(extraInfo)],
    stack: captureLongStack(error),
  });

  Object.defineProperty(error, "reset", {
    value: reset,
    enumerable: false,
    configurable: true,
  });

  Object.defineProperty(error, "getErrorData", {
    value: getErrorData,
    enumerable: false,
    configurable: true,
  });

  return error;
};

//
// util
//

/**
 *
 * - Ensure errors during cloning is caught, and a panic error message is shown.
 */
export const safeCloneInfo = (message: string, info: Array<unknown>) => {
  try {
    const clonedInfo = captureArrayEntries(info);

    const rawInfo = clonedInfo.reduce<string>(
      (acc, cur) => acc + "\n" + capturedTos(cur),
      ""
    );

    const rawMessage = message + rawInfo;

    return { rawMessage, clonedInfo };
  } catch (e) {
    const panicMsg = "JabError.safeCloneInfo() - error during clone:";

    console.log(panicMsg, e);

    //fail safe

    return { rawMessage: message, clonedInfo: [panicMsg, "" + e] };
  }
};
