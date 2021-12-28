import { getSyntheticError, isNode } from "^jab";
import {
  ErrorEvent,
  JagoLogEntry,
  JagoSend,
  MakeSend,
  PromiseRejectionEvent,
} from "../jabc";

/**
 *
 */
export const defaultOnError = (error: any) => {
  console.log(error?.message || "No message on error");
  error?.stack && console.log(error?.stack);
};

/**
 * Use for tunnelling jago messages on same ipc as the on the script uses.
 */
export const makeJagoSend = (send: (msg: any) => void): JagoSend => (
  msg: JagoLogEntry
) =>
  send({
    channel: "jago_channel_token",
    ...msg,
  });

/**
 * todo
 *  - browser main and iframe can't really exit, right.
 */
export const beeExit = () => {
  if (isNode()) {
    (global.process as any).exit();
  } else {
    //The only way to exit a web worker is to request the parent to terminate the worker.
    // from within it's only possible to empty eventloop by calling `close`.
    (global as any).postMessage({
      channel: "jago_channel_token",
      type: "NO_MORE_WORK",
    });
  }
};

/**
 * - No real need for making. Except for asserting everything is fine at 'load' rather than at send.
 */
export const makeSend: MakeSend = () => {
  if (isNode()) {
    const { parentPort, isMainThread } = eval("require")("worker_threads");

    if (isMainThread) {
      if (!(global.process as any).send) {
        throw new Error("Ipc should be active in main thread.");
      }
      return (msg) => (global.process as any).send(msg);
    } else {
      if (!parentPort) {
        throw new Error("You should be there for me parentPort.");
      }
      return (msg) => parentPort.postMessage(msg);
    }
  } else {
    return (msg) => (global as any).postMessage(msg);
  }
};

/**
 * We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnMessage = (
  listener: (msg: any) => void,
  onError: (error: unknown) => void = defaultOnError
) => {
  if (isNode()) {
    const { parentPort, isMainThread } = eval("require")("worker_threads");

    if (isMainThread) {
      (global.process as any).on("message", listener);
    } else {
      if (!parentPort) {
        throw new Error("You should be there for me parentPort.");
      }

      parentPort.on("message", listener);
    }
  } else {
    (global as any).onmessage = (msgEvent: any) => {
      try {
        listener(msgEvent.data);
      } catch (error: any) {
        onError(error);
      }
    };
  }
};

/**
 * We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnUnhandleRejection = (
  listener: (event: PromiseRejectionEvent) => void,
  onError: (error: unknown) => void = defaultOnError
) => {
  if (isNode()) {
    global.process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        listener({
          reason,
          promise,
          defaultPrevented: true, //default is prevented by default in node, just by having a handler.
          preventDefault: () => {},
        });
      }
    );
  } else {
    (global as any).addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        try {
          listener(event);
        } catch (error: any) {
          onError(error);
        }
      }
    );
  }
};

/**
 * We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnUncaughtException = (
  listener: (event: ErrorEvent) => void,
  onError: (error: unknown) => void = defaultOnError
) => {
  if (isNode()) {
    global.process.on("uncaughtException", (error: unknown) => {
      listener({
        error,
        defaultPrevented: true, //default is prevented by default in node, just by having a handler.
        preventDefault: () => {},
      });
    });
  } else {
    (global as any).addEventListener("error", (event: any) => {
      try {
        if (event.error) {
          listener(event);
        } else {
          //happens when accessing unset variables in web workers
          //but the event just contains this meaningless message: 'Script error.'
          if (event.message !== "Script error.") {
            console.log("null error event unknown: " + event.message);
          }

          listener({
            error: getSyntheticError(
              event.message,
              event.filename || undefined, //avoid string when it's a blank string.
              event.lineno
            ),
            defaultPrevented: event.defaultPrevented,
            preventDefault: () => event.preventDefault(),
          });

          return;
        }
      } catch (error: any) {
        onError(error);
      }
    });
  }
};
