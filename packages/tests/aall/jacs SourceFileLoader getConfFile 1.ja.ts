import { getPackagePath } from "^config/project.conf";
import { SourceFileLoader } from "^jacs/";
import { TestProvision } from "^jarun";

import { getScratchPath } from "../_fixture";

export default (prov: TestProvision) => {
  const { eq } = prov;

  const sfl = new SourceFileLoader({ onError: prov.onError });

  const confFile = getPackagePath("tests/tsconfig.json").replace(/\\/g, "/");

  eq(confFile, sfl.getConfFile(getScratchPath("hello.js")));
  eq(confFile, sfl.getConfFile(getScratchPath("dontExist.js"))); //not relevant if the source file exists.
  eq(confFile, sfl.getConfFile(confFile));

  //not found
  eq(null, sfl.getConfFile("C:/Darhadni/fictiveScript.js"));
  eq(null, sfl.getConfFile("C:/"));
};
