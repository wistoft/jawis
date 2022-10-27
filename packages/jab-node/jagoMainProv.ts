import { JagoLogEntry } from "^jagoc";

import {
  cloneArrayEntries,
  err,
  FinallyProvider,
  fixErrorInheritence,
  indent,
  LogProv,
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

//for testing
export type JagoSend = (msg: JagoLogEntry) => void;

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
 * - sendImpl is needed for testing.
 */
export const mainProvToJago = (sendImpl: JagoSend, logPrefix = "") => {
  const onError = makeJagoOnError(sendImpl);
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeJagoLogProv(sendImpl, logPrefix);

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
export const makeJagoOnError =
  (sendImpl: JagoSend): OnError =>
  (error, extraInfo) => {
    sendImpl({
      type: "error",
      data: unknownToErrorData(error, extraInfo),
    });
  };

/**
 * Tries to batch stream data, so it at least gets less mixed between different streams.
 */
export const makeJagoLogProv = (
  sendImpl: JagoSend,
  logPrefix = ""
): LogProv => ({
  log: (...args) =>
    sendImpl({
      type: "log",
      data: cloneArrayEntries(args),
      logName: logPrefix,
    }),
  logStream: (type, data) =>
    sendImpl({
      type: "stream",
      data: typeof data === "string" ? data : data.toString(),
      logName: logPrefix ? logPrefix + type : type,
    }),
  status: () => {
    err("not impl");
  },
});

/**
 *
 */
export const mainProvToConsole = (logPrefix = ""): MainProv => {
  const onError = makeOnErrorToConsole();
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeLogServiceToConsole(logPrefix);

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
 * - errors are printed slightly different, than node would.
 */
export const makeOnErrorToConsole = (): OnError => (error: any, extraInfo) => {
  if (!(error instanceof Error)) {
    console.log("Threw non-error:");
    console.log(error);
    return;
  }

  const clone = { ...error } as any;

  //extra info

  if (extraInfo) {
    clone.info = extraInfo;
  }

  //jab

  delete clone.__jawisNodeStack; //not really sure how mainWrapper and jacs interact.
  delete clone.jabMessage; //not needed, when printing to console.
  delete clone.clonedInfo; //not needed, when printing to console.

  //system

  if (clone.code === "MODULE_NOT_FOUND") {
    delete clone.code;
    delete clone.requireStack;
  }

  //output

  console.log(error.stack);

  if (Object.keys(clone).length !== 0) {
    console.log(clone);
  }
};

/**
 * Tries to batch stream data, so it at least gets less mixed between different streams.
 *
 * - Only first line of a log-section has the prefix.
 * - Additional newlines are introduced. But there's really no way to avoid that.
 */
export const makeLogServiceToConsole = (
  logPrefix = "",
  delay = 250
): LogProv => {
  let streamData: any = {};
  let timeoutHandle: any;
  let largestType = 0;

  const emitStream = () => {
    Object.entries(streamData).forEach(([type, data]) => {
      const firstPrefix = (logPrefix + type).padEnd(largestType, " ") + " : ";
      const nextPrefix = "".padEnd(largestType, " ") + " : ";

      //send
      console.log(firstPrefix + indent(data as string, 1, nextPrefix));

      //reset
      streamData = {};
      timeoutHandle = undefined;
    });
  };

  return {
    log: console.log,
    logStream: (type, data) => {
      if (logPrefix.length + type.length > largestType) {
        largestType = logPrefix.length + type.length;
      }

      if (streamData[type]) {
        streamData[type] += typeof data === "string" ? data : data.toString();
      } else {
        streamData[type] = typeof data === "string" ? data : data.toString();
      }

      if (!timeoutHandle) {
        timeoutHandle = setTimeout(emitStream, delay);
      }
    },
    status: (type, status) => {
      console.log(type + " is " + status);
    },
  };
};

/**
 * Wrap main logic
 *
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
 */
export const mainWrapper = (
  logPrefix: string,
  main: (mainProv: MainProv) => void,
  type: "console" | "jago" = "console",
  registerOnShutdown = false,
  doRegisterRejectionHandlers = true
) => {
  const mainProv =
    type === "console" ? mainProvToConsole() : mainProvToJago(makeSend());

  if (doRegisterRejectionHandlers) {
    registerRejectionHandlers(mainProv.onError);
  }

  process.on("beforeExit", () => {
    //fx console.log in finally functions will 'reset beforeExit', so we need to protect against being called multiple times.
    if (mainProv.finalProv.isActive()) {
      mainProv.finalProv.runFinally();
    }
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
  //there can be only one

  if (process.listenerCount("uncaughtException") !== 0) {
    throw new Error("uncaughtException handler already registered");
  }

  if (process.listenerCount("unhandledRejection") !== 0) {
    throw new Error("unhandledRejection handler already registered");
  }

  //we are the one

  process.on("uncaughtException", (error) => {
    onError(error, ["uh-exception"]);
  });

  process.on("unhandledRejection", (reason) => {
    onError(reason, ["uh-promise"]);
  });
};
