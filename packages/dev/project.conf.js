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
  "bee-node",
  "bee-web-worker",
  "cached-resolve",
  "dev-compv",
  "finally-provider",
  "lazy-require-ts",
  "long-traces",
  "loop-controller",
  "main-wrapper",
  "pack-util",
  "parse-captured-stack",
  "react-use-ws",
  "render-hook-plus",
  "state-waiter",
  "ts-config-util",
  "ts-reload",
  "view-exception",
  "yapu",
];

const scopedPackages = [
  "console",
  "jab-express",
  "jab-node",
  "jab-react",
  "jab",
  "jabc",
  "jabro",
  "jabroc",
  "jabrov",
  "jacs",
  "jagoc",
  "jagos",
  "jagov",
  "jarun",
  "jarunc",
  "jatec",
  "jates",
  "jatev",
  "javi",
];

const privatePackages = ["dev", "javi-client", "misc", "tests"];

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
