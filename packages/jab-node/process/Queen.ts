import { parentPort, isMainThread } from "worker_threads";
import { MakeSend } from "^jabc";

//
// for communicating with a parent process via ipc or via worker api.
//

/**
 *
 */
export const registerOnMessage_old = (listener: (msg: any) => void) => {
  if (isMainThread) {
    process.on("message", listener);
  } else {
    if (!parentPort) {
      throw new Error("You should be there for me parentPort.");
    }

    parentPort.on("message", listener);
  }
};

/**
 *
 */
export const removeOnMessage = (listener: (msg: any) => void) => {
  if (isMainThread) {
    process.removeListener("message", listener);
  } else {
    if (!parentPort) {
      throw new Error("You should be there for me parentPort.");
    }

    parentPort.removeListener("message", listener);
  }
};

/**
 * - No real need for making. Except for asserting everything is fine at 'load'
 *    rather than at send.
 */
export const makeSend_old: MakeSend = () => {
  //quick fix
  if (isMainThread) {
    if (!process.send) {
      throw new Error("Ipc should be active in main thread.");
    }
  } else {
    if (!parentPort) {
      throw new Error("You should be there for me parentPort.");
    }
  }

  return (msg) => {
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
};
