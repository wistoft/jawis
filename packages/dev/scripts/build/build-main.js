const { makeJawisBuildManager } = require("./build-functions");
const {
  projectRoot,
  publishBuildFolder,
  npmScope,
  npmVersion,
  npmDistTag,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
} = require("../../project.conf");

makeJawisBuildManager(
  projectRoot,
  publishBuildFolder,
  npmScope,
  npmVersion,
  npmDistTag,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  /* replacePathForRelease */ true,
  phpPackages
)
  .build()
  .catch(console.log);
