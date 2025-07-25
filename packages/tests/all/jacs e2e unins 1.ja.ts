import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { uninstall } from "^jacs";
import { runJacsBee_test } from "../_fixture";

//import alias isn't used, when uninstalled

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

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
