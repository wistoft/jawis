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
  /* replacePathForRelease */ true
)
  .build()
  .catch(console.log);
