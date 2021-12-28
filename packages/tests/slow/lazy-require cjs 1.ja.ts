import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

// Commonjs module exports nothing

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  const mod = require(getScriptPath("hello.js"));

  console.log("nothing printed, yet.");

  console.log(Object.keys(mod));
};
