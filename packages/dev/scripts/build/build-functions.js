const path = require("path");
const fs = require("fs");
const fastGlob = require("fast-glob");
const fse = require("fs-extra");
const del = require("del");

const { copyingFiles } = require("./util");

/**
 *
 */
const makeJawisBuildManager = (
  projectFolder,
  buildFolder,
  npmScope,
  npmVersion,
  npmDistTag,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  replacePathForRelease
) => {
  const files = "{README.md,}";

  //derived

  const packageFolder = path.join(projectFolder, "packages");
  const bulidTscFolder = path.join(projectFolder, "build-tsc");

  const packagesPattern =
    "{" + [...scopedPackages, ...unscopedPackages].join(",") + "}"; //bug: for one package it's: `{jab,}` or `jab`

  //
  // functions
  //

  /**
   *
   */
  const getFullPackageName = (packageName) => {
    if (scopedPackages.includes(packageName)) {
      return npmScope + "/" + packageName;
    } else if (unscopedPackages.includes(packageName)) {
      return packageName;
    } else if (privatePackages.includes(packageName)) {
      throw new Error(
        "Can't get full name of a private package: " + packageName
      );
    } else {
      throw new Error("Package not listed in build file: " + packageName);
    }
  };

  /**
   *
   */
  const getSiblingDeps = async (packageName, fullPackageName = true) => {
    const confStr = await fs.promises.readFile(
      path.join(projectFolder, "./packages/" + packageName + "/tsconfig.json")
    );

    const conf = JSON.parse(confStr);

    //gather references to local packages.

    const extra = {};

    if (conf.references) {
      conf.references.forEach((def) => {
        const tmp = getFullPackageName(
          def.path.replace(/^\.\.\//, ""),
          npmScope,
          scopedPackages,
          unscopedPackages,
          privatePackages
        );

        const tmp2 = fullPackageName ? tmp : def.path.replace(/^\.\.\//, "");

        extra[tmp2] = npmVersion;
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
   * - excludes private packages.
   */
  const getAllPackageDeps = async () => {
    const res = {};
    const packages = await fastGlob([packagesPattern], {
      cwd: packageFolder,
      onlyDirectories: true,
    });

    for (const packageName of packages) {
      res[packageName] = Object.keys(await getSiblingDeps(packageName, false));
    }

    return res;
  };

  /**
   *
   */
  const checkPackageDestinations = async () => {
    //check declared packages in build file

    await checkPackagesExistsInCodebase(scopedPackages);
    await checkPackagesExistsInCodebase(unscopedPackages);
    await checkPackagesExistsInCodebase(privatePackages);

    //check all packages in the codebase

    for (const packageName of fs.readdirSync("./packages/")) {
      checkPackageHasDeclaredDestination(packageName);

      await checkPackageJsonFile(packageName);

      await checkRootTsConfigHasPackage(packageName);
    }
  };

  /**
   *
   */
  const checkPackagesExistsInCodebase = async (packages) => {
    for (const packageName of packages) {
      if (
        !(await fse.pathExists(
          path.join(projectFolder, "packages", packageName)
        ))
      ) {
        throw new Error(
          "Package declared in build file not found: " + packageName
        );
      }
    }
  };

  /*
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
      throw new Error(
        "Package has no declaration in build file: " + packageName
      );
    }

    if (count !== 1) {
      throw new Error(
        "Package has multiple declarations in build file: " + packageName
      );
    }
  };

  /**
   *
   */
  const checkPackageJsonFile = async (packageName) => {
    const confStr = await fs.promises.readFile(
      path.join(projectFolder, "./packages/" + packageName + "/package.json")
    );

    return checkPackageJson(JSON.parse(confStr), packageName);
  };

  /**
   *
   */
  const checkPackageJson = async (json, packageName) => {
    if (json.name !== "~" + packageName) {
      throw new Error(
        "name in package.json expexted to be: ~" +
          packageName +
          ", was: " +
          json.name
      );
    }

    if (json.version === undefined) {
      throw new Error("Missing version in package.json for: " + packageName);
    }

    if (json.description === undefined || json.description === "") {
      console.log("Missing description in package.json for: " + packageName);
    }

    if (json.keywords === undefined || json.keywords.length === 0) {
      console.log("Missing keywords in package.json for: " + packageName);
    }
  };

  /**
   *
   */
  const checkRootTsConfigHasPackage = async (packageName) => {
    const confStr = await fs.promises.readFile(
      path.join(projectFolder, "./tsconfig.json")
    );

    const conf = JSON.parse(confStr);

    const found = conf.references.some(
      (obj) => obj.path === "./packages/" + packageName
    );

    if (!found) {
      throw new Error(
        "root tsconfig.json does not contain the package: " + packageName
      );
    }
  };

  /**
   *
   */
  const transformPackageJson = async (json, packageName) => {
    await checkPackageJson(json, packageName);

    if (json.version === "0.0.0") {
      json.version = npmVersion;
    }

    json.name = getFullPackageName(packageName);

    json.main = "./index.js";
    json.types = "./index.d.ts";
    json.homepage =
      "https://github.com/wistoft/jawis/tree/master/packages/" +
      packageName +
      "#readme";

    json.repository = {
      type: "git",
      url:
        "https://github.com/wistoft/jawis/tree/master/packages/" + packageName,
    };

    // json.publishConfig = {
    //   access: "public",
    //   tag: npmDistTag,
    // };

    try {
      json.dependencies = {
        ...(await getSiblingDeps(packageName)),
        ...json.dependencies,
      };
    } catch (e) {
      setTimeout(() => {
        throw e;
      }, 0);
    }

    json.license = "MIT";

    return json;
  };

  /**
   *
   */
  const copyFiles = () =>
    copyingFiles(["packages/" + packagesPattern + "/" + files, buildFolder], {
      up: 1,
    });

  /**
   *
   */
  const buildPackageJson = async () => {
    const files = await fastGlob([packagesPattern + "/package.json"], {
      cwd: packageFolder,
    });

    for (const file of files) {
      const packageName = path.basename(file.replace(/\/package\.json$/, ""));

      //read

      const jsonStr = await fs.promises.readFile(
        path.join(packageFolder, file)
      );

      const json = JSON.parse(jsonStr);

      //transform

      const result = JSON.stringify(
        await transformPackageJson(json, packageName),
        undefined,
        2
      );

      //write to build folder

      const target = path.join(buildFolder, file);

      await fse.ensureDir(path.dirname(target));
      await fs.promises.writeFile(target, result);
    }
  };

  /**
   *
   */
  const buildTs = async () => {
    const files = await fastGlob([packagesPattern + "/**/*{.js,.d.ts}"], {
      cwd: bulidTscFolder,
    });

    for (const file of files) {
      //read

      const codeBuffer = await fs.promises.readFile(
        path.join(bulidTscFolder, file)
      );

      //replace windows newlines

      const codeStr = codeBuffer.toString().replace(/\r/g, "");

      //replace imports

      const result = replacePathForRelease
        ? transformImports(file, codeStr)
        : codeStr;

      //write to build folder

      const target = path.join(buildFolder, file);

      await fse.ensureDir(path.dirname(target));
      await fs.promises.writeFile(target, result);
    }
  };

  /**
   *
   */
  const transformImports = (file, code) => {
    //transform dynamic import

    const code2 = code.replace(
      new RegExp('import\\("\\^([^"/]*)', "g"),
      (match, packageName) => 'import("' + getFullPackageName(packageName)
    );

    //transform static import/require

    if (file.endsWith(".js")) {
      return code2.replace(
        new RegExp('require\\("\\^([^"/]*)', "g"),
        (match, packageName) => 'require("' + getFullPackageName(packageName)
      );
    } else {
      return code2.replace(
        new RegExp(' from "\\^([^"/]*)', "g"),
        (match, packageName) => ' from "' + getFullPackageName(packageName)
      );
    }
  };

  /**
   *
   */
  const build = async () => {
    await del(buildFolder);
    await checkPackageDestinations();
    await buildPackageJson();
    await copyFiles();
    await buildTs();
  };

  return {
    getFullPackageName,
    getSiblingDeps,
    getAllPackageDeps,
    checkPackageDestinations,
    checkPackagesExistsInCodebase,
    checkPackageHasDeclaredDestination,
    checkPackageJsonFile,
    checkRootTsConfigHasPackage,
    transformPackageJson,
    copyFiles,
    buildPackageJson,
    buildTs,
    build,
  };
};

//
// exports
//

module.exports = {
  makeJawisBuildManager,
};
