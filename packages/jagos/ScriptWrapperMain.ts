import async_hooks from "node:async_hooks";

import { BeeMain, monkeyPatchConsoleFunction } from "^bee-common";
import { enable } from "^long-traces";

import { main as wppMain } from "^process-util";

/**
 * duplication between beeConfMain, ScriptWrapperMain and ymer
 */
export const main: BeeMain = (prov) => {
  //register rejection handlers

  prov.registerErrorHandlers(prov.onError);

  // intercept logging

  monkeyPatchConsoleFunction(prov.sendLog, "error");
  monkeyPatchConsoleFunction(prov.sendLog, "warn");
  monkeyPatchConsoleFunction(prov.sendLog, "log");
  monkeyPatchConsoleFunction(prov.sendLog, "info");

  //long traces

  enable(async_hooks);

  //process preloader

  wppMain(prov);
};
