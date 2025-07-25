import { makeJawisBuildManager } from "^dev/scripts/build";
import { npmScope } from "^dev/project.conf";
import { emptyScratchFolder, getMonorepoProjectPath, getScratchPath } from ".";

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
    [] /* phpPackages */
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
    await makeTestJawisBuildManager().getAllSiblingDeps(),
    true
  );
