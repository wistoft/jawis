import util from "util";
import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//wrong type

export default (prov: TestProvision) => {
  try {
    getReusableWPPAndDeps(prov, { filename: 144 as any });

    console.log("din't throw");
  } catch (error) {
    prov.eq("ERR_INVALID_ARG_TYPE", error.code);
  }
};
