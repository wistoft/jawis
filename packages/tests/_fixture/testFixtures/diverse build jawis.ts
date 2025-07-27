import { BuildDeps, makeJawisBuildManager } from "^dev/scripts/build";
import { npmScope } from "^dev/project.conf";
import { emptyScratchFolder, getMonorepoProjectPath, getScratchPath } from ".";

/**
 *
 */
export const makeJawisBuildDeps = (): BuildDeps => ({
  projectFolder: "unused",
  buildFolder: "unused",
  npmScope: "@jawis",
  scopedPackages: ["scoped-library"],
  unscopedPackages: ["first-library", "second-library"],
  privatePackages: [],
  replacePathForRelease: false,
  phpPackages: [],
  allowPrivate: false,
});

/**
 *
 */
export const makeTestJawisBuildManager = () => {
  emptyScratchFolder();

  return makeJawisBuildManager(
    getMonorepoProjectPath(),
    getScratchPath(),
    npmScope,
    ["scoped-library"] /* scopedPackages */,
    ["first-library", "second-library"] /* unscopedPackages */,
    [] /* privatePackages */,
    false,
    [] /* phpPackages */,
    false
  );
};

/**
 *
 */
export const testTransformPackageJson = async (
  json: any,
  packageName: any,
  targetFolder: any,
  dependencies: any
) =>
  makeTestJawisBuildManager().transformPackageJson(
    json,
    packageName,
    targetFolder,
    dependencies,
    await makeTestJawisBuildManager().getAllSiblingDeps("1.2.3-dev"),
    true,
    "1.2.3-dev"
  );
