import { BeeMain, BeeConf } from "^bee-common";

/**
 *
 * duplication between beeConfMain, ScriptWrapperMain and ymer
 */
export const main: BeeMain<BeeConf> = (prov) => {
  //register rejection handlers

  prov.registerErrorHandlers(prov.onError);

  //long traces

  // enable(async_hooks);
};
