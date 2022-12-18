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

makeJawisBuildManager(
  projectRoot,
  publishBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  /* replacePathForRelease */ true,
  phpPackages
)
  .build()
  .catch(console.log);
