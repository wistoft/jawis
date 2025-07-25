import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const manager = makeTestJawisBuildManager();

  console.log(manager.getFullPackageName("first-library"));
  console.log(manager.getFullPackageName("scoped-library"));
};
