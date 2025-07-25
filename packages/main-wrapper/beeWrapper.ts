import { makeMainBeeProv } from "^bee-common";
import { SendLog } from "^jab";

import { MainWrapperDeps, mainWrapperHelper } from "./internal";

type Deps = { sendLog: SendLog } & Omit<
  MainWrapperDeps,
  "doRegisterErrorHandlers"
>;

/**
 *
 * impl
 *  - no rejection handlers, because jago does that already.
 */
export const beeMainWrapper = (deps: Deps) => {
  const mainProv = makeMainBeeProv(deps.sendLog, deps.logPrefix);

  mainWrapperHelper({ ...deps, mainProv, doRegisterErrorHandlers: false });
};
