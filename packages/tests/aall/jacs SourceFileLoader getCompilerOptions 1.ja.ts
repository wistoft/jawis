import { SourceFileLoader } from "^jacs/";
import { TestProvision } from "^jarun";

import { getScratchPath } from "../_fixture";

export default (prov: TestProvision) => {
  const { eq } = prov;

  const sfl = new SourceFileLoader({ onError: prov.onError });

  const c1 = sfl.getCompilerOptions(getScratchPath("hello.js"));
  const c2 = sfl.getCompilerOptions(getScratchPath("hello.js"));

  eq(c1, c2);

  //not found

  eq({}, sfl.getCompilerOptions("C:/Darhadni/fictiveScript.js"));
  eq({}, sfl.getCompilerOptions("C:/fictiveScript.js"));
};
