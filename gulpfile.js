const { src, dest, series } = require("gulp");
const gts = require("gulp-typescript");
const del = require("del");
const jeditor = require("gulp-json-editor");
const replace = require("gulp-replace");
const gulpif = require("gulp-if");
const merge = require("merge2");

//conf

const npmVersion = "1.0.0";

const projectConf = require("./project.conf");

const npmScope = "@jawis";

const files = "{README.md,}";

const packages = [
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
  "util-javi",
  "util-dev",
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
          const packageName = json.name;

          json.name = npmScope + "/" + packageName;

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
          };

          const localDeps = getSiblingDeps(packageName);

          for (const key in localDeps) {
            if (
              json.dependencies === undefined ||
              json.dependencies[key] === undefined
            ) {
              console.log(
                "Error: " + json.name + " is missing dependency: " + key
              );
            }
          }

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

      extra[required] = "dummy";
    });
  }

  return extra;
};

module.exports = {
  build: makeBuild("build/publish"),
  clean: makeClean("build/publish"),
  buildAlpha: makeBuildAlpha(projectConf.alphaBuildFolder),
  buildPackageJson: makeBuildPackageJson("build/publish"),
  files: makeCopyFiles("build/publish"),
};
