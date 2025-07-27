import { TestProvision } from "^jarun";
import { makeJawisBuildDeps, makeTestJawisBuildManager } from "^tests/_fixture";

export default (prov: TestProvision) => {
  console.log(
    makeTestJawisBuildManager().getFullPackageName({
      ...makeJawisBuildDeps(),
      packageName: "dontExist",
      allowPrivate: false,
    })
  );
};
