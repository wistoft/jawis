import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

export default (prov: TestProvision) =>
  makeTestJawisBuildManager().getAllPackageDeps();
