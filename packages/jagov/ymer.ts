import {
  registerOnUncaughtException,
  registerOnUnhandleRejection,
  makeJagoSend,
  makeSend,
  makeCatchingSetTimeout,
} from "^jab";
import { makeOnError, monkeyPatchConsoleFunction } from "./ymerUtil";

//
// minder meget om: beeConfMain.ts
//

/*
 * Note
 *  Can't use console.log. It will cause infinite loop.
 */

const send = makeJagoSend(makeSend());
const onError = makeOnError(send);

//
// intercept logging
//

// This is needed in the web worker, otherwise the data goes to the console, and not to the controller.
//  The user might not have access to the console. And expects to get the output on the bee callbacks.

monkeyPatchConsoleFunction(send, "error");
monkeyPatchConsoleFunction(send, "warn");
monkeyPatchConsoleFunction(send, "log");
monkeyPatchConsoleFunction(send, "info");

//
// allow boot script (in beehive) to do pretty logging.
//

(self as any).onError = onError;

//
// intercept errors
//

// minder meget om registerRejectionHandlers in jagoMainProv

registerOnUncaughtException((event) => {
  event.preventDefault(); //needed so the error doesn't continue to parent.
  onError(event.error);
});

registerOnUnhandleRejection((event) => {
  event.preventDefault(); //doesn't work in firefox, the error is still shown in the native console.
  onError(event.reason);
});

//
// intercept errors in setTimeout
//

// We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.

(global as any).setTimeout = makeCatchingSetTimeout(onError);
