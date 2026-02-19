const { makeJawisBuildManager } = require("./build-functions");
const {
  projectRoot,
  publishBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
} = require("../../project.conf");

export const makeLiveJawisBuildManager = () =>
  makeJawisBuildManager(
    projectRoot,
    publishBuildFolder,
    npmScope,
    scopedPackages,
    unscopedPackages,
    privatePackages,
    /* replacePathForRelease */ true,
    phpPackages
  );
