import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { getScriptPath, runJacsBee_test } from "../_fixture";

// Eager works, when called explicit. (But only for first require. Not transitive.)

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  (require as any).eager(getScriptPath("helloRequire"));
};
