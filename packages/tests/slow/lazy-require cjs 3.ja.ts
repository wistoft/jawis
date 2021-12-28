import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

// Commonjs module exports class

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  const Classy = require(getScriptPath("exportClass"));

  console.log(Classy.prop);
  console.log(new Classy());
};
