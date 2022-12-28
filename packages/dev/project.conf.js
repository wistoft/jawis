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
  "async-capture",
  "assorted-algorithms",
  "bee-common",
  "dev-compv",
  "finally-provider",
  "lazy-require-ts",
  "loop-controller",
  "parse-captured-stack",
  "render-hook-plus",
  "state-waiter",
  "ts-config-util",
  "view-exception",
  "yapu",
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
  "use-websocket",
];

const privatePackages = ["dev", "javi-client", "misc", "tests"];

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
