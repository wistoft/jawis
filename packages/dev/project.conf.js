const path = require("path");

const projectRoot = path.join(__dirname, "../../");
const packageFolder = path.resolve(projectRoot, "packages");
const publishBuildFolder = path.resolve(projectRoot, "build/publish");
const relativeWebBuildFolder = "javi/client";
const alphaBuildFolder = path.resolve(projectRoot, "build-alpha");
const javiMinBuildFolder = path.join(projectRoot, "build-jm");

//dev configuration

const serverPort = 3000;
const webpackPort = 3001;
const jagoConsolePortForDev = 3003;

//prototype

const prototypeVersion = "5.0.0-dev"; //must be without ^

//emit warnings

const emitWarningOnNoReadme = true;
const emitWarningOnNoKeywords = true;
const emitWarningOnNoDescription = true;

//release configuration

const npmScope = "@jawis";

const unscopedPackages = [
  "assorted-algorithms",
  "async-capture",
  "bee-common",
  "bee-node",
  "bee-php",
  "bee-remote-node",
  "bee-web-worker",
  "cached-resolve",
  "dev-compc",
  "dev-comps",
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
  "view-exception",
  "yapu",
];

const scopedPackages = [
  "console",
  "jab-express",
  "jab-node",
  "jab-react",
  "jab",
  "jabu",
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
  "jate-behat",
  "jate-php-unit",
  "jate-rust",
  "javi",
  "javic",
  "git-util",
  "log-server",
  "node-module-hooks-plus",
  "process-util",
  "react-helm",
  "shared-algs",
  "shared-buffer-store",
  "shared-dynamic-map",
  "shared-lock",
  "shared-page-heap",
  "shared-tree",
  "stdio-filter",
  "stdio-protocol",
  "webcs",
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

const phpPackages = ["phasic"];

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
// exports jawis functions from release, so develop can use them.
//

// const getMakeMakeJacsWorkerBee = () => require("@jawis/jacs").makeMakeJacsWorkerBee; // prettier-ignore
const getMakeMakeJacsWorkerBee = () => require("../../build-alpha/jacs").makeMakeJacsWorkerBee; // prettier-ignore

// const getReleasedConsoleCaptureMain = () => "@jawis/console/consoleCaptureMain.js"; // prettier-ignore
const getReleasedConsoleCaptureMain = () => path.join( projectRoot, "build-alpha", "javi/client/consoleCaptureMain.js"); // prettier-ignore

//
// export
//

module.exports = {
  projectRoot,
  packageFolder,
  publishBuildFolder,
  relativeWebBuildFolder,
  alphaBuildFolder,
  javiMinBuildFolder,
  getPackagePath,
  emitWarningOnNoReadme,
  emitWarningOnNoKeywords,
  emitWarningOnNoDescription,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
  packagesPatternIncludingPrivate,
  allPackagesIncludingPrivate,

  //dev
  serverPort,
  webpackPort,
  jagoConsolePortForDev,
  getMakeMakeJacsWorkerBee,
  getReleasedConsoleCaptureMain,
  prototypeVersion,
};
