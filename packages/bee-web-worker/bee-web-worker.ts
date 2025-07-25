import {
  BeeDef,
  BeeProv,
  makeBeeOnError,
  makeSendTunneledLog,
  runBee,
} from "^bee-common";
import { assert, getSyntheticError, OnError } from "^jab";
import { then } from "^yapu";

/**
 *
 */
export const getBeeProv = (
  jabroRequire: (filename: string) => unknown,
  channelToken: string | number
): BeeProv => {
  const sendLog = makeSendTunneledLog(beeSend, channelToken);
  const { onError } = makeBeeOnError(sendLog);
  const importModule = (filename: string) => then(() => jabroRequire(filename));

  const beeProv: BeeProv = {
    beeSend,
    sendLog,
    beeExit: () => beeExit(channelToken),
    onError,
    registerErrorHandlers,
    registerOnMessage: (listener) => {
      registerOnMessage(listener, onError);
    },
    removeOnMessage,
    importModule,
    runBee: (beeDef: BeeDef, setGlobal) => runBee(beeProv, beeDef, setGlobal),
  };

  return beeProv;
};

/**
 *
 */
export const beeSend = (msg: any) => global.postMessage(msg);

/**
 * Exit the bee from within
 *
 * impl
 *  The only way to exit a web worker is to request the parent to terminate the worker.
 *    From within it's only possible to empty the eventloop by calling `close`.
 */
export const beeExit = (channelToken: string | number) => {
  beeSend({
    noMoreWork: channelToken,
  });
};

/**
 * - Try catch is needed to catch all errors, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnMessage = (
  listener: (msg: any) => void,
  onError: (error: unknown) => void
) => {
  assert(global.onmessage === null, "multiple listeners: not impl");

  global.onmessage = (msgEvent) => {
    try {
      listener(msgEvent.data);
    } catch (error: any) {
      onError(error);
    }
  };
};

/**
 *
 */
export const removeOnMessage = () => {
  global.onmessage = undefined as any;
};

/**
 *
 */
export const registerErrorHandlers = (onError: OnError) => {
  registerOnUnhandleRejection(onError);
  registerOnUncaughtException(onError);
};

/**
 * - Try catch is needed to catch all errors, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnUnhandleRejection = (onError: OnError) => {
  addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    try {
      event.preventDefault(); //doesn't work in firefox, the error is still shown in the native console.
      onError(event.reason, ["uh-promise"]);
    } catch (error: any) {
      console.log(error.message);
      console.log(error.stack);
    }
  });
};

/**
 * - Try catch is needed to catch all errors, because a web worker turns some errors into "Script error.", which is useless.
 */
export const registerOnUncaughtException = (onError: OnError) => {
  addEventListener("error", (event: ErrorEvent) => {
    try {
      event.preventDefault(); //needed so the error doesn't continue to parent.

      if (event.error) {
        onError(event.error, ["uh-exception"]);
      } else {
        //happens when accessing unset variables in web workers
        //but the event just contains this meaningless message: 'Script error.'
        if (event.message !== "Script error.") {
          console.log("error unknown: " + event.message);
        }

        onError(
          {
            error: getSyntheticError(
              event.message,
              event.filename || undefined, //avoid string when it's a blank string.
              event.lineno
            ),
          },
          ["uh-exception"]
        );
      }
    } catch (error: any) {
      console.log(error.message);
      console.log(error.stack);
    }
  });
};
