import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

export default (prov: TestProvision) =>
  makeTestJawisBuildManager().checkRootTsConfigHasPackage("dont-exist");
