import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

//it exists, so it doesn't throw.

export default (prov: TestProvision) =>
  makeTestJawisBuildManager().checkPackagesExistsInCodebase(["first-library"]);
