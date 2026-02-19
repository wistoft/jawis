const { npmScope } = require("../../../../packages/dev/project.conf");
const {
  makeJawisBuildManager,
} = require("../../../../packages/dev/scripts/build/build-functions");

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
    await makeTestJawisBuildManager().getAllSiblingDeps("1.2.3-dev"),
    true,
    dependencies,
    "1.2.3-dev"
  );
