import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jab";
import { uninstall } from "^jacs";
import { getScriptPath, runJacsBee_test } from "../_fixture";

//can't compile, when uninstalled

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  const helloScript = getScriptPath("helloTs.ts");

  uninstall();

  const mod = require(helloScript);
  console.log("no problem yet, because of lazy.");

  mod.fido; //throws here.
};
