const { makeJawisBuildManager } = require("./build-functions");
const {
  projectRoot,
  alphaBuildFolder,
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
  alphaBuildFolder,
  npmScope,
  npmVersion,
  npmDistTag,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  /* replacePathForRelease */ false,
  phpPackages
)
  .build()
  .catch(console.log);
