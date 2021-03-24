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

import {
  flushAndExit,
  JabShutdownMessage,
  MainProv,
  makeSend,
  OnError,
  registerOnMessage,
} from ".";

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
    log: console.log,
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
 */
export const mainProvToConsole = (logPrefix = ""): MainProv => {
  const onError = makeOnErrorToConsole(logPrefix);
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeLogServiceToConsole();

  return {
    onError,
    finalProv,
    finally: finalProv.finally,
    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 *
 */
// eslint-disable-next-line unused-imports/no-unused-vars-ts
export const mainProvToJago = (logPrefix = "") => {
  throw new Error("not impl");
};

/**
 *
 */
export const makeOnErrorToConsole = (logPrefix = ""): OnError => (
  error,
  extraInfo
) => {
  if (extraInfo) {
    console.log(logPrefix + "onError: ", error, "\n", tos(extraInfo));
  } else {
    console.log(logPrefix + "onError: ", error);
  }
};

/**
 * Wrap main logic
 *
 * - Catch exceptions and report. But don't exit.
 * - An UserMessage will not cause an exit. The message is just logged to console.
 *    - The work will of cause cancel, because it threw an exception.
 *    - The UserMessage is only relevant for sync phase. The possibly following async phase want be watch.
 *        I.e. exceptions in setTimeout or promise rejections.
 * - Execute finally functions before exit.
 *   - But not if process.exit is called. There's no way to register a handler for that.
 * - Flush std io before exit. This allows finally functions to use std io.
 * - Send output to either console or jago.
 * - registerOnShutdown means to explicit exit, when: Jab sends an ipc message to exit.
 *    - This keeps the process running, even if everything else has finished.
 *        So can't be used with a process, that exits by itself.
 *
 * worker compat?
 *  - Does finally run if exit because event loop empties.
 */
export const mainWrapper = (
  logPrefix: string,
  main: (mainProv: MainProv) => void,
  type: "console" | "jago" = "console",
  registerOnShutdown = false
) => {
  const mainProv =
    type === "console"
      ? mainProvToConsole(logPrefix)
      : mainProvToJago(logPrefix);

  registerRejectionHandlers(mainProv.onError);

  process.on("beforeExit", () => {
    mainProv.finalProv.runFinally();
  });

  if (registerOnShutdown) {
    registerOnMessage((msg: JabShutdownMessage) => {
      if (msg.type === "shutdown") {
        Promise.resolve()
          .then(mainProv.finalProv.runFinally)
          .finally(flushAndExit);
      }
    });
  }

  try {
    main(mainProv);
  } catch (e) {
    if (e instanceof UserMessage) {
      mainProv.log(e.getUserMessage());
    } else {
      throw e;
    }
  }
};

/**
 *
 */
export const registerRejectionHandlers = (onError: OnError) => {
  process.on("uncaughtException", (error) => {
    onError(error, ["uh-exception"]);
  });

  process.on("unhandledRejection", (reason) => {
    onError(reason, ["uh-promise"]);
  });
};
