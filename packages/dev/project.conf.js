const path = require("path");

const projectRoot = path.join(__dirname, "../../");
const packageFolder = path.resolve(projectRoot, "packages");
const publishBuildFolder = path.resolve(projectRoot, "build/publish");
const alphaBuildFolder = path.resolve(projectRoot, "build-alpha");

const npmScope = "@jawis";

const unscopedPackages = [
  "assorted-algorithms",
  "async-capture",
  "bee-common",
  "cached-resolve",
  "finally-provider",
  "lazy-require-ts",
  "long-traces",
  "loop-controller",
  "main-wrapper",
  "parse-captured-stack",
  "react-use-ws",
  "state-waiter",
  "ts-config-util",
  "view-exception",
  "yapu",
];

const scopedPackages = [
  "jab-express",
  "jab-node",
  "jab-react",
  "jab",
  "jabc",
  "jacs",
  "jagoc",
  "jagos",
  "jarun",
  "jarunc",
  "jatec",
  "jates",
  "javi",
];

const privatePackages = [
  "dev",
  "javi-client",
  "misc",
  "tests",
  "render-hook-plus",
  "pack-util",
  "dev-compv",
  "bee-node",
  "jabrov",
  "jabro",
  "jabroc",
  "jatev",
  "jagov",
  "console",
  "bee-web-worker",
];

const phpPackages = [];

//
// derived
//

const allPackagesIncludingPrivate = [
  ...scopedPackages,
  ...unscopedPackages,
  ...privatePackages,
];

const packagesPatternIncludingPrivate =
  "{" +
  [...scopedPackages, ...unscopedPackages, ...privatePackages].join(",") +
  "}";

/**
 * Get an absolute path, from a path relative to package folder.
 */
const getPackagePath = (file) => path.join(packageFolder, file || "");

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
  allPackagesIncludingPrivate,
};
