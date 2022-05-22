import { parentPort, isMainThread } from "worker_threads";

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
