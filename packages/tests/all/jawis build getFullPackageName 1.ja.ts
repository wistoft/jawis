import { TestProvision } from "^jarun";
import { makeJawisBuildDeps, makeTestJawisBuildManager } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const manager = makeTestJawisBuildManager();

  console.log(
    manager.getFullPackageName({
      ...makeJawisBuildDeps(),
      packageName: "first-library",
      allowPrivate: false,
    })
  );
  console.log(
    manager.getFullPackageName({
      ...makeJawisBuildDeps(),
      packageName: "scoped-library",
      allowPrivate: false,
    })
  );
};
