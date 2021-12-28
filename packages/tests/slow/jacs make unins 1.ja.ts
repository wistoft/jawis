import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import { uninstall } from "^jacs";

//import alias isn't used, when uninstalled

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  uninstall();

  try {
    const mod = require("^jagos");
    console.log("no problem yet, because of lazy.");

    mod.fido; //throws here.
  } catch (error: any) {
    console.log(error.message.replace(/\n[^]*$/, ""));
  }
};
