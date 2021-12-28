import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

// Commonjs module exports function

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  const func = require(getScriptPath("exportFunction"));

  console.log(func());
};
