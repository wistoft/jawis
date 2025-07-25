import { interceptResolve } from "^node-module-hooks-plus";
import { BeeMain, main as ppMain } from "^bee-common";

import { makeMakeRequireSender } from "./internal";

/**
 *
 */
export const main: BeeMain = (prov) => {
  //process preloader

  ppMain(prov);

  //register require last, to avoid noise

  interceptResolve(makeMakeRequireSender(prov.beeSend));
};
