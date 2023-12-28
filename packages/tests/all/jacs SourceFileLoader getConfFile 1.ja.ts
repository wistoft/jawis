import { SourceFileLoader } from "^jacs/";
import { TestProvision } from "^jarun";
import { getProjectPath, getFixturePath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { eq } = prov;

  const sfl = new SourceFileLoader({ onError: prov.onError });

  const confFile = getProjectPath("packages/tests/tsconfig.json").replace(
    /\\/g,
    "/"
  );

  eq(confFile, sfl.getConfFile(getFixturePath("dontExist.js"))); //not relevant if the source file exists.
  eq(confFile, sfl.getConfFile(confFile));

  eq(null, sfl.getConfFile("/"));
  eq(null, sfl.getConfFile("/bla/bla"));
};
