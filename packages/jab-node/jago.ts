import { parentPort } from "worker_threads";
import { JagoLogEntry } from "^jagoc";

import {
  cloneArrayEntries,
  FinallyProvider,
  fixErrorInheritence,
  indent,
  LogProv,
  tos,
  unknownToErrorData,
} from "^jab";

import { flushAndExit, MainProv, makeSend } from ".";

//hacky
let parentSend: (entry: JagoLogEntry) => void;

//only send  if it's possible.

if (process.send || parentPort) {
  parentSend = (entry: JagoLogEntry) => {
    //wasteful to make it each time
    makeSend()(entry);
  };
}

/**
 *
 */
export const outHtml = (html: string) => {
  if (parentSend) {
    parentSend({ type: "html", data: html });
  } else {
    console.log("Html not displayed in console.");
  }
};

/**
 * todo: encode
 */
export const outLink = (name: string, href: string) => {
  outHtml(`<a href="${href}">${name}</a>`);
};

/**
 * todo: encode
 */
export const outImg = (src: string) => {
  outHtml(`<img src="${src}" />`);
};

/**
 *
 */
export const out = (...data: unknown[]) => {
  if (parentSend) {
    parentSend({ type: "log", data: cloneArrayEntries(data) });
  } else {
    console.log(tos(data));
  }
};

/**
 *
 */
export const onError = (error: unknown, extraInfo: Array<unknown> = []) => {
  if (parentSend) {
    parentSend({
      type: "error",
      data: unknownToErrorData(error, extraInfo),
    });
  } else {
    console.log(error, "\n", tos(extraInfo));
  }
};

/**
 * Tries to batch stream data, so it at least gets less mixed between different streams.
 */
export const makeLogServiceToConsole: () => LogProv = () => {
  let streamData: any = {};
  let timeoutHandle: any;
  let largestType = 0;

  const emitStream = () => {
    Object.entries(streamData).forEach(([type, data]) => {
      const prefix = type.padEnd(largestType, " ") + ": ";

      //send
      console.log(
        prefix + indent(data as string, 1, "".padEnd(largestType, " ") + ": ")
      );

      //reset
      streamData = {};

      //manage
      timeoutHandle = undefined;
    });
  };

  return {
    log: (...args) => {
      console.log(...args);
    },
    logStream: (type, data: string | Uint8Array) => {
      if (type.length > largestType) {
        largestType = type.length;
      }

      if (streamData[type]) {
        streamData[type] += typeof data === "string" ? data : data.toString();
      } else {
        streamData[type] = typeof data === "string" ? data : data.toString();
      }

      if (!timeoutHandle) {
        timeoutHandle = setTimeout(emitStream, 250);
      }
    },
    status: (type, status) => {
      console.log(type + " is " + status);
    },
  };
};

/**
 * For throwing user messages.
 *
 * - Throw this error to stop execution and show an error message to the user.
 * - Throwing this error to means the stack is of no importance. I.e. the application knows this error is throws.
 *    The message is for the end user, which have little use for the stack, in general, and no use for the stack,
 *    in this case, because the application intended to show a message to the user.
 */
export class UserMessage extends Error {
  constructor(private ownMessage: string) {
    // fallback message for when this is caught as Error
    super(ownMessage);

    fixErrorInheritence(this, UserMessage.prototype);
  }

  public getUserMessage() {
    return this.ownMessage;
  }
}

/**
 *
 * todo
 *  Should support parent
 */
export const mainProvToConsole = (logPrefix = "") => {
  const logProv = makeLogServiceToConsole();

  const onError = (error: unknown) => {
    console.log(logPrefix + "onError: ", error);
  };

  const finalProv = new FinallyProvider({ onError });

  return {
    onError: onError,

    finalProv,
    finally: finalProv.finally,

    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 *
 * todo
 *  Should this allow exit. If so, don't use rejection handlers.
 */
export const mainWrapper = (
  logPrefix: string,
  work: (prov: MainProv) => void
) => {
  registerRejectionHandlers();

  try {
    work(mainProvToConsole(logPrefix));
  } catch (e) {
    if (e instanceof UserMessage) {
      console.log(e.getUserMessage());
      flushAndExit();
    } else {
      throw e;
    }
  }
};

/**
 *
 */
export const registerRejectionHandlers = () => {
  const onUnhandledPromiseRejection: NodeJS.UnhandledRejectionListener = (
    reason
  ) => {
    onError(reason, ["uh-promise"]);
  };

  const onUncaughtException = (error: Error) => {
    onError(error, ["uh-exception"]);
  };

  process.on("uncaughtException", onUncaughtException);
  process.on("unhandledRejection", onUnhandledPromiseRejection);
};
//
