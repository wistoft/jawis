import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

import { uninstall } from "^jacs";

//can't compile, when uninstalled

//doesn't pass, because 'ts-node' has registered a js-handler, that compiles ts code.

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  const helloScript = getScriptPath("helloTs.ts");

  uninstall();

  try {
    const mod = require(helloScript);
    console.log("no problem yet, because of lazy.");

    mod.fido; //throws here.
  } catch (error: any) {
    console.log(error.toString());
  }
};
