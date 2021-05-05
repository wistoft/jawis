const path = require("path");

const projectRoot = __dirname;
const packageFolder = path.resolve(projectRoot, "packages");
const alphaBuildFolder = path.resolve(projectRoot, "build-alpha");
const publishBuildFolder = path.resolve(projectRoot, "build/publish");

/**
 * Get an absolute path, from a path relative to package folder.
 */
const getPackagePath = (file) => path.join(packageFolder, file || "");

module.exports = {
  projectRoot,
  packageFolder,
  alphaBuildFolder,
  publishBuildFolder,
  getPackagePath,
};
