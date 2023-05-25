import { getBeeProv } from "^bee-web-worker";
import { makeCatchingSetTimeout } from "^yapu";

import { makeOnError } from "./internal";

/**
 *
 */
export const startBee = (
  jabroRequire: (filename: string) => unknown,
  channelToken: string | number,
  filename: string
) => {
  // bee provision

  const beeProv = getBeeProv(jabroRequire, channelToken);

  const onError = makeOnError(beeProv.beeSend);

  // intercept errors

  beeProv.registerErrorHandlers(onError);

  // Intercept errors in setTimeout
  //  We need to catch all errors in the browser, because a web worker turns some errors into "Script error.", which is useless.

  (global as any).setTimeout = makeCatchingSetTimeout(
    onError,
    (global as any).setTimeout
  );

  //run the script

  beeProv.importModule(filename);
};

(globalThis as any).QUICK_FIX_EXPORT = { startBee };
