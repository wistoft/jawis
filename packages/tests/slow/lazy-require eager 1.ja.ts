import { TestProvision } from "^jarun";

import { getScriptPath, makeJacs_lazy } from "../_fixture";

// Eager works, when called explicit. (But only for first require. Not transitive.)

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  (require as any).eager(getScriptPath("helloRequire"));
};
