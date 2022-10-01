const path = require("path");

const projectRoot = path.join(__dirname, "../../");
const packageFolder = path.resolve(projectRoot, "packages");
const publishBuildFolder = path.resolve(projectRoot, "build/publish");
const alphaBuildFolder = path.resolve(projectRoot, "build-alpha");

/**
 * Get an absolute path, from a path relative to package folder.
 */
const getPackagePath = (file) => path.join(packageFolder, file || "");

const npmScope = "@jawis";

const npmVersion = "1.0.2-dev.1";

const npmDistTag = "dev";

const unscopedPackages = ["lazy-require-ts"];

const scopedPackages = [
  "console",
  "jab",
  "jab-express",
  "jab-node",
  "jab-react",
  "jacs",
  "jagoc",
  "jagos",
  "jagov",
  "jarun",
  "jatec",
  "jates",
  "jatev",
  "javi",
  "misc",
  "util-dev",
  "util-javi",
];

const privatePackages = [
  "dev",
  "dev-appc",
  "dev-apps",
  "dev-appv",
  "javi-client",
  "tests",
];

//
// export
//

module.exports = {
  projectRoot,
  packageFolder,
  publishBuildFolder,
  alphaBuildFolder,
  getPackagePath,
  npmScope,
  npmVersion,
  npmDistTag,
  scopedPackages,
  unscopedPackages,
  privatePackages,
};
