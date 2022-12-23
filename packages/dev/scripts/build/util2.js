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

module.exports.makeLiveJawisBuildManager = () =>
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
