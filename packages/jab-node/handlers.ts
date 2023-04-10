import { parentPort, isMainThread } from "worker_threads";

import { OnError } from "^jab";

/**
 *
 */
export const registerErrorHandlers = (onError: OnError) => {
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

/**
 *
 */
export const postMessage = (msg: any) => {
  if (isMainThread) {
    if (!process.send) {
      throw new Error("Ipc should be active in main thread.");
    }

    process.send(msg);
  } else {
    if (!parentPort) {
      throw new Error("You should be there for me parentPort.");
    }

    parentPort.postMessage(msg);
  }
};
