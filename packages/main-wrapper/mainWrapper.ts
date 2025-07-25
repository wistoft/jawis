import async_hooks from "node:async_hooks";

import { ErrorData, indent, LogProv, OnError, OnErrorData } from "^jab";
import { FinallyProvider } from "^finally-provider";
import { BeeShutdownMessage } from "^bee-common";
import { enable } from "^long-traces";
import {
  asyncFlushAndExit,
  MainProv,
  registerOnMessage,
  registerErrorHandlers,
} from "^jab-node";

export type MainConsoleWrapperDeps = MainWrapperDeps & {
  consoleGroupingDelay?: number;
};

export type MainWrapperDeps = {
  logPrefix?: string;
  main: (mainProv: MainProv) => void;
  registerOnShutdown?: boolean;
  doRegisterErrorHandlers?: boolean;
  enableLongTraces?: boolean;
};

type MainWrapperHelperDeps = {
  main: (mainProv: MainProv) => void;
  mainProv: MainProv;
  registerOnShutdown?: boolean;
  doRegisterErrorHandlers?: boolean;
  enableLongTraces?: boolean;
};

/**
 *
 */
export const mainWrapper = (deps: MainConsoleWrapperDeps) => {
  const mainProv = makeMainProvToConsole(
    deps.logPrefix,
    deps.consoleGroupingDelay
  );

  mainWrapperHelper({ ...deps, mainProv });
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
 * - registerOnShutdown means to explicit exit, when: Jab sends an ipc message to exit.
 *    - This keeps the process running, even if everything else has finished.
 *        So can't be used with a process, that exits by itself.
 *
 */
export const mainWrapperHelper = ({
  main,
  mainProv,
  registerOnShutdown = true,
  doRegisterErrorHandlers = true,
  enableLongTraces = false,
}: MainWrapperHelperDeps) => {
  if (enableLongTraces) {
    enable(async_hooks);
  }

  if (doRegisterErrorHandlers) {
    registerErrorHandlers(mainProv.onError);
  }

  process.on("beforeExit", () => {
    //fx console.log in finally functions will 'reset beforeExit', so we need to protect against being called multiple times.
    if (mainProv.finalProv.isActive()) {
      mainProv.finalProv.runFinally();
    }
  });

  if (registerOnShutdown) {
    registerOnMessage((msg: BeeShutdownMessage) => {
      if (msg.type === "shutdown") {
        Promise.resolve()
          .then(mainProv.finalProv.runFinally)
          .finally(asyncFlushAndExit);
      }
    });
  }

  try {
    main(mainProv);
  } catch (e) {
    if ((e as any).userMessage) {
      mainProv.log((e as any).userMessage);
    } else {
      throw e;
    }
  }
};

/**
 *
 */
export const makeMainProvToConsole = (
  logPrefix = "",
  consoleGroupingDelay = 250
): MainProv => {
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeLogServiceToConsole(logPrefix, consoleGroupingDelay);

  return {
    onError,
    onErrorData,
    finalProv,
    finally: finalProv.finally,
    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 * quick fix. should be printed better
 */
export const onErrorData: OnErrorData = (error: ErrorData) => {
  console.log(error.msg);
  console.log(error.stack);
  console.log(error.info);
};

/**
 *
 * - errors are printed slightly different than node would.
 */
export const onError: OnError = (error: any, extraInfo) => {
  if (typeof error !== "object" || error === null) {
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
    //to avoid ANSI escape codes, that nodejs 20 starts to emit.
    console.log(JSON.stringify(clone));
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
  consoleGroupingDelay = 250
): LogProv => {
  let streamData: any = {};
  let timeoutHandle: any;
  let largestType = 0;

  const emitStream = () => {
    Object.entries(streamData).forEach(([type, data]) => {
      const firstPrefix = (logPrefix + type).padEnd(largestType, " ") + " : ";
      const nextPrefix = "".padEnd(largestType, " ") + " : ";

      //send
      console.log(indent(data as string, 1, nextPrefix, firstPrefix));

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
        timeoutHandle = setTimeout(emitStream, consoleGroupingDelay);
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
export const makeUserMessage = (msg: string) => {
  const e = new Error(msg);

  (e as any).userMessage = msg;

  return e;
};
