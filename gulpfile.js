const fs = require("fs");
const { src, dest, series } = require("gulp");
const gts = require("gulp-typescript");
const del = require("del");
const jeditor = require("gulp-json-editor");
const replace = require("gulp-replace");
const gulpif = require("gulp-if");
const merge = require("merge2");

const projectConf = require("./project.conf");

//conf

const npmScope = "@jawis";

const npmVersion = "1.0.2-dev.1";
const npmDistTag = "dev";

const files = "{README.md,}";

const scopedPackages = [
  "console",
  "jab",
  "jab-express",
  "jab-node",
  "jab-react",
  "jabc",
  "jabro",
  "jabroc",
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
  "util-dev",
];

const unscopedPackages = ["ts-reload"];

const privatePackages = [
  "dev",
  "dev-appc",
  "dev-apps",
  "dev-appv",
  "javi-client",
  "misc",
  "tests",
];

//derived

const packagesPattern =
  "{" + [...scopedPackages, ...unscopedPackages].join(",") + "}"; //bug: for one package it's: `{jab,}` or `jab`

//
// init project
//

const tsProject = gts.createProject("tsconfig.base.web.json", {
  declaration: true,
  isolatedModules: false, //hacky, that this chooses between transpile and compile
});

/**
 *
 */
const makeClean = (outDir) => {
  const clean = () => del(outDir);

  return clean;
};

/**
 *
 */
const makeBuildTs = (outDir, npmPaths) => {
  const buildTs = () => {
    const tsResult = src([
      "packages/" + packagesPattern + "/**/*.{js,ts,tsx}",
      "!**/_dev/**",
      "!**/node_modules/**",
    ]).pipe(tsProject());

    return (
      merge([tsResult.js, tsResult.dts])
        //js
        .pipe(
          gulpif(
            npmPaths,
            replace(
              new RegExp('require\\("\\^([^"/]*)', "g"),
              (match, packageName) =>
                'require("' + getFullPackageName(packageName)
            )
          )
        )
        //dts
        .pipe(
          gulpif(
            npmPaths,
            replace(
              new RegExp(' from "\\^([^"/]*)', "g"),
              (match, packageName) =>
                ' from "' + getFullPackageName(packageName)
            )
          )
        )
        .pipe(dest(outDir))
    );
  };

  return buildTs;
};

/**
 *
 */
const makeCopyFiles = (outDir) => {
  const copyFiles = () =>
    src(["packages/" + packagesPattern + "/" + files]).pipe(dest(outDir));

  return copyFiles;
};

/**
 *
 */
const makeBuildPackageJson = (outDir) => {
  const buildPackageJson = () =>
    src([
      "packages/" + packagesPattern + "/**/package.json",
      "!**/node_modules/**",
    ])
      .pipe(
        jeditor((json) => {
          const packageName = json.name.replace(/^~/, "");
          json.version = npmVersion;

          json.name = getFullPackageName(packageName);

          json.main = "./index.js";
          json.types = "./index.d.ts";

          json.repository = {
            type: "git",
            url: "https://github.com/wistoft/jawis.git",
            directory: "packages/" + packageName,
          };

          //for lerna
          json.publishConfig = {
            access: "public",
            tag: npmDistTag,
          };

          try {
            json.dependencies = {
              ...getSiblingDeps(packageName),
              ...json.dependencies,
            };
          } catch (e) {
            setTimeout(() => {
              throw e;
            }, 0);
          }

          json.license = "MIT";

          return json;
        })
      )
      .pipe(dest(outDir));

  return buildPackageJson;
};

/**
 *
 */
const makeBuild = (outDir) =>
  series(
    makeClean(outDir),
    checkPackageDestinations,
    makeBuildPackageJson(outDir),
    makeCopyFiles(outDir),
    makeBuildTs(outDir, true)
  );

/**
 *
 */
const makeBuildAlpha = (outDir) =>
  series(
    makeClean(outDir),
    checkPackageDestinations,
    makeBuildTs(outDir, false)
  );

/**
 *
 */
const getSiblingDeps = (packageName) => {
  const conf = require("./packages/" + packageName + "/tsconfig.json");

  //gather references to local packages.

  const extra = {};

  if (conf.references) {
    conf.references.forEach((def) => {
      const packageName = getFullPackageName(def.path.replace(/^\.\.\//, ""));

      extra[packageName] = npmVersion;
    });
  }

  //check compiler options is set correctly

  const outDir = "../../build-tsc/" + packageName;

  if (conf.compilerOptions.outDir !== outDir) {
    throw new Error(
      "Expected outDir in tsconfig.json for '" +
        packageName +
        "' to be: " +
        outDir
    );
  }

  //done

  return extra;
};

/**
 *
 */
const checkPackageDestinations = (cb) => {
  //check declared packages in gulpfile

  checkPackagesExistsInCodebase(scopedPackages);
  checkPackagesExistsInCodebase(unscopedPackages);
  checkPackagesExistsInCodebase(privatePackages);

  //check all packages in the codebase

  for (const packageName of fs.readdirSync("./packages/")) {
    checkPackageHasDeclaredDestination(packageName);

    checkPackageJsonFile(packageName);

    checkRootTsConfigHasPackage(packageName);
  }

  //done

  cb();
};

/**
 *
 */
const getFullPackageName = (packageName) => {
  if (scopedPackages.includes(packageName)) {
    return npmScope + "/" + packageName;
  } else if (unscopedPackages.includes(packageName)) {
    return packageName;
  } else if (privatePackages.includes(packageName)) {
    throw new Error("Can't get full name of a private package: " + packageName);
  } else {
    throw new Error("Package not listed in gulpfile: " + packageName);
  }
};

/**
 *
 */
const checkPackagesExistsInCodebase = (packages) => {
  for (const packageName of packages) {
    if (!fs.existsSync("./packages/" + packageName)) {
      throw new Error("Package declared in gulp not found: " + packageName);
    }
  }
};

/**
 *
 */
const checkPackageHasDeclaredDestination = (packageName) => {
  let count = 0;

  if (scopedPackages.includes(packageName)) {
    count++;
  }

  if (unscopedPackages.includes(packageName)) {
    count++;
  }

  if (privatePackages.includes(packageName)) {
    count++;
  }

  if (count === 0) {
    throw new Error("Package has no declaration in gulpfile: " + packageName);
  }

  if (count !== 1) {
    throw new Error(
      "Package has multiple declarations in gulpfile: " + packageName
    );
  }
};

/**
 *
 */
const checkPackageJsonFile = (packageName) => {
  const conf = require("./packages/" + packageName + "/package.json");

  if (conf.version !== "0.0.0") {
    throw new Error("version in package.json should be 0.0.0: " + packageName);
  }

  if (conf.name !== "~" + packageName) {
    throw new Error(
      "name in package.json expexted to be: ~" +
        packageName +
        ", was: " +
        conf.name
    );
  }
};

/**
 *
 */
const checkRootTsConfigHasPackage = (packageName) => {
  const conf = require("./tsconfig.json");

  const found = conf.references.some(
    (obj) => obj.path === "./packages/" + packageName
  );

  if (!found) {
    throw new Error(
      "root tsconfig.json does not contain the package: " + packageName
    );
  }
};

module.exports = {
  build: makeBuild("build/publish"),
  clean: makeClean("build/publish"),
  buildAlpha: makeBuildAlpha(projectConf.alphaBuildFolder),
  buildPackageJson: makeBuildPackageJson("build/publish"),
  files: makeCopyFiles("build/publish"),

  //for testing
  getSiblingDeps,
  getFullPackageName,
  checkPackageDestinations,
  checkPackagesExistsInCodebase,
};
