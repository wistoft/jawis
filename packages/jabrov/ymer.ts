import { monkeyPatchConsoleFunction } from "^bee-common";
import { getBeeProv } from "^bee-web-worker";
import { AbsoluteFile, MainFileDeclaration } from "^jab";
import { makeCatchingSetTimeout } from "^yapu";

import { makeOnError } from "./internal";

export const ymerMainDeclaration: MainFileDeclaration = {
  type: "web-module",
  file: "ymer",
  folder: __dirname,
};

/**
 *
 * duplication between beeConfMain, ScriptWrapperMain and ymer
 * Note
 *  - must intercept logging in web workers
 *      This is needed in the web worker, otherwise the data goes to the console, and not to the controller.
 *       The user might not have access to the console. And expects to get the output on the bee callbacks.
 */
export const startBee = (
  jabroRequire: (filename: string) => unknown,
  channelToken: string | number,
  filename: AbsoluteFile
) => {
  // bee provision

  const beeProv = getBeeProv(jabroRequire, channelToken);

  const onError = makeOnError(beeProv.sendLog);
  beeProv.onError = onError; //quick fix to fx get sourcemap

  // intercept logging

  monkeyPatchConsoleFunction(beeProv.sendLog, "error");
  monkeyPatchConsoleFunction(beeProv.sendLog, "warn");
  monkeyPatchConsoleFunction(beeProv.sendLog, "log");
  monkeyPatchConsoleFunction(beeProv.sendLog, "info");

  // allow boot script (in beehive) to do pretty logging.

  (self as any).onError = onError;

  // intercept errors

  beeProv.registerErrorHandlers(onError);

  // Intercept errors in setTimeout
  //  We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.

  (global as any).setTimeout = makeCatchingSetTimeout(onError);

  //run the script

  beeProv.runBee({ filename }, true);
};
