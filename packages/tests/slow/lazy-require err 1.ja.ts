import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

// Module load throws

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  const mod = require(getScriptPath("throw.js"));
  console.log("no problem yet");

  console.log(Object.keys(mod));
};
