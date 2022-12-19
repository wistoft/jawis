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

const unscopedPackages = [
  "assorted-algorithms",
  "lazy-require-ts",
  "loop-controller",
  "render-hook-plus",
];

const scopedPackages = [
  "console",
  "jab",
  "jabc",
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
  "util-javi",
];

const privatePackages = [
  "dev",
  "dev-appc",
  "dev-apps",
  "dev-appv",
  "javi-client",
  "misc",
  "tests",
];

const phpPackages = [];

//
// derived
//

const packagesPatternIncludingPrivate =
  "{" +
  [...scopedPackages, ...unscopedPackages, ...privatePackages].join(",") +
  "}";

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
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
  packagesPatternIncludingPrivate,
};
