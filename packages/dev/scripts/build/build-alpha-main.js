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
  /* replacePathForRelease */ false
)
  .build()
  .catch(console.log);
