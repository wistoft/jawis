const path = require("path");
const { src, dest, series } = require("gulp");
const gts = require("gulp-typescript");
const del = require("del");
const jeditor = require("gulp-json-editor");
const replace = require("gulp-replace");
const named = require("vinyl-named");
const gulpif = require("gulp-if");
const merge = require("merge2");

//conf

const npmVersion = "0.0.15";

const projectConf = require("./packages/config/project.conf");

const npmScope = "@wistoft";

const files = "{README.md,}";

const packages = [
  "jab",
  "jab-express",
  "jab-node",
  "jab-react",
  "jacs",
  "jadev-console",
  "jagoc",
  "jagos",
  "jagov",
  "jarun",
  "jatec",
  "jates",
  "jatev",
  "javi",
  "jawis-util",
];

//derived

const packagesPattern = "{" + packages.join(",") + "}"; //bug: for one package it's: `{jab,}` or `jab`

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
      "packages/" + packagesPattern + "/**/*.{ts,tsx}",
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
              new RegExp('require\\("\\^', "g"),
              'require("' + npmScope + "/"
            )
          )
        )
        //dts
        .pipe(
          gulpif(
            npmPaths,
            replace(new RegExp(' from "\\^', "g"), ' from "' + npmScope + "/")
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

          json.name = npmScope + "/" + packageName;

          json.main = "./index.js";
          json.types = "./index.d.ts";

          json.repository = {
            type: "git",
            url: "https://github.com/wistoft/jadev.git",
            directory: "packages/" + packageName,
          };

          //for lerna
          json.publishConfig = {
            access: "public",
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
    makeBuildTs(outDir, true),
    makeBuildPackageJson(outDir),
    makeCopyFiles(outDir)
  );

/**
 *
 */
const makeBuildAlpha = (outDir) =>
  series(makeClean(outDir), makeBuildTs(outDir, false));

/**
 *
 */
const getSiblingDeps = (packageName) => {
  const conf = require("./packages/" + packageName + "/tsconfig.json");

  const extra = {};

  if (conf.references) {
    conf.references.forEach((def) => {
      const required = def.path.replace(/^\.\./, npmScope);

      if (required === "@wistoft/config") {
        //this should not be published
        return;
      }

      extra[required] = npmVersion;
    });
  }

  return extra;
};

module.exports = {
  build: makeBuild("build/publish"),
  clean: makeClean("build/publish"),
  buildAlpha: makeBuildAlpha(projectConf.alphaBuildFolder),
  files: makeCopyFiles("build/publish"),
};
