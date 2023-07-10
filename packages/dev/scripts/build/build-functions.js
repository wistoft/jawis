const path = require("path");
const fs = require("fs");
const fastGlob = require("fast-glob");
const fse = require("fs-extra");
const del = require("del");

const { copyingFiles, sortObject, emitVsCodeError } = require("./util");

const tscBuildFolderName = "build-tsc";

/**
 *
 */
const makeJawisBuildManager = (
  projectFolder,
  buildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  replacePathForRelease,
  phpPackages
) => {
  const files = "{README.md,CHANGELOG.md}";

  //derived

  const packageFolder = path.join(projectFolder, "packages");
  const bulidTscFolder = path.join(projectFolder, tscBuildFolderName);

  const packagesPattern =
    "{" + [...scopedPackages, ...unscopedPackages].join(",") + "}"; //bug: for one package it's: `{jab,}` or `jab`

  //duplicated
  const packagesPatternIncludingPrivate =
    "{" +
    [...scopedPackages, ...unscopedPackages, ...privatePackages].join(",") +
    "}";

  //
  // functions
  //

  /**
   *
   */
  const getFullPackageName = (packageName, allowPrivate = false) => {
    if (scopedPackages.includes(packageName)) {
      return npmScope + "/" + packageName;
    } else if (unscopedPackages.includes(packageName)) {
      return packageName;
    } else if (privatePackages.includes(packageName)) {
      if (allowPrivate) {
        return packageName;
      } else {
        throw new Error(
          "Can't get full name of a private package: " + packageName
        );
      }
    } else {
      throw new Error("Package not listed in build file: " + packageName);
    }
  };

  /**
   *
   */
  const getSiblingPackages = async (
    packageName,
    fullPackageName = true,
    allowPrivate = false
  ) => {
    const confStr = await fs.promises.readFile(
      path.join(projectFolder, "./packages/" + packageName + "/tsconfig.json")
    );

    const conf = JSON.parse(confStr);

    //gather references to local packages.

    const deps = [];

    if (conf.references) {
      conf.references.forEach((def) => {
        const tmp = getFullPackageName(
          def.path.replace(/^\.\.\//, ""),
          allowPrivate
        );

        const tmp2 = fullPackageName ? tmp : def.path.replace(/^\.\.\//, "");

        deps.push(tmp2);
      });
    }

    //check compiler options is set correctly

    const outDir = "../../" + tscBuildFolderName + "/" + packageName;

    if (conf.compilerOptions.outDir !== outDir) {
      throw new Error(
        "Expected outDir in tsconfig.json for '" +
          packageName +
          "' to be: " +
          outDir
      );
    }

    //done

    return deps;
  };

  /**
   * The dependencies on other packages in the repo.
   *
   * - includes private packages, as quick fix.
   */
  const getAllPackageDeps = async (
    fullPackageName = true,
    allowPrivate = false
  ) => {
    const pattern = allowPrivate
      ? packagesPatternIncludingPrivate
      : packagesPattern;

    const res = {};
    const packages = await fastGlob([pattern], {
      cwd: packageFolder,
      onlyDirectories: true,
    });

    for (const packageName of packages) {
      const tmp = fullPackageName
        ? getFullPackageName(packageName, allowPrivate)
        : packageName;

      res[tmp] = await getSiblingPackages(
        packageName,
        fullPackageName,
        allowPrivate
      );
    }

    return res;
  };

  /**
   *
   */
  const getAllSiblingDeps = async () => {
    const tmp = [];
    const versions = {};

    const packages = await fastGlob([packagesPattern], {
      cwd: packageFolder,
      onlyDirectories: true,
    });

    for (const packageName of packages) {
      //deps without versions

      tmp.push([packageName, await getSiblingPackages(packageName)]);

      //find version

      const jsonStr = await fs.promises.readFile(
        path.join(packageFolder, packageName, "package.json")
      );

      const json = JSON.parse(jsonStr);

      const fullName = getFullPackageName(packageName);

      versions[fullName] = "^" + json.version;
    }

    //make deps with right versions.

    const res = {};

    for (const [packageName, deps] of tmp) {
      const versionDeps = {};

      for (const dep of deps) {
        versionDeps[dep] = versions[dep];
      }

      res[packageName] = versionDeps;
    }

    return res;
  };

  /**
   *
   */
  const checkPackages = async () => {
    //check declared packages in build file

    await checkPackagesExistsInCodebase(scopedPackages);
    await checkPackagesExistsInCodebase(unscopedPackages);
    await checkPackagesExistsInCodebase(privatePackages);
    await checkPackagesExistsInCodebase(phpPackages);

    //check all packages in the codebase

    for (const packageName of fs.readdirSync("./packages/")) {
      checkPackageHasDeclaration(packageName);

      if (phpPackages.includes(packageName)) {
        //todo: check composer.json
      } else {
        await checkPackageJsonFile(packageName);

        await checkRootTsConfigHasPackage(packageName);

        if (!privatePackages.includes(packageName)) {
          await checkPackageHasReadme(packageName);
        }
      }
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
  const checkPackageHasDeclaration = (packageName) => {
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

    if (phpPackages.includes(packageName)) {
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
  const checkPackageHasReadme = async (packageName) => {
    if (
      !(await fse.pathExists(
        path.join(projectFolder, "./packages/" + packageName + "/README.md")
      ))
    ) {
      emitVsCodeError({
        file: path.join(packageFolder, packageName, "README.md"),
        message: "Missing README.md: " + packageName,
        severity: "warning",
      });
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
    const file = path.join(packageFolder, packageName, "package.json");

    //package name

    if (json.name !== "~" + packageName) {
      throw new Error(
        "name in package.json expexted to be: ~" +
          packageName +
          ", was: " +
          json.name
      );
    }

    //private packages

    if (privatePackages.includes(packageName)) {
      if (json.private !== true) {
        emitVsCodeError({
          file,
          message: "Package listed as private has other value in package.json: " + packageName, // prettier-ignore
        });
      }

      if (json.version && json.version !== "0.0.0") {
        emitVsCodeError({
          file,
          message: "Version should be 0.0.0 for private package: " + packageName, // prettier-ignore
        });
      }

      //private packages are not checked further.

      return;
    }

    // only public packages

    if (json.private) {
      emitVsCodeError({
        file,
        message: "Package listed as public has other value in package.json: " + packageName, // prettier-ignore
      });
    }

    if (json.version === undefined) {
      emitVsCodeError({
        file,
        message: "Version should be set for public package: " + packageName, // prettier-ignore
      });
    }

    if (json.private && json.private !== true) {
      if (json.version === undefined) {
        emitVsCodeError({
          file,
          message: "Missing version in package.json for: " + packageName, // prettier-ignore
        });
      }
    }

    if (json.sideEffects === undefined && !json.private) {
      emitVsCodeError({
        file,
        message: "SideEffects must be set",
      });
    }

    if (json.description === undefined || json.description === "") {
      emitVsCodeError({
        file,
        message: "Missing description in package.json for: " + packageName,
        severity: "warning",
      });
    }

    if (json.keywords === undefined || json.keywords.length === 0) {
      emitVsCodeError({
        file,
        message: "Missing keywords in package.json for: " + packageName,
        severity: "warning",
      });
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
  const transformPackageJson = async (
    json,
    packageName,
    targetFolder,
    siblingDeps,
    checkSideEffects = true
  ) => {
    json.name = getFullPackageName(packageName);

    json.main = "./index.js";
    json.types = "./index.d.ts";
    json.homepage =
      "https://github.com/wistoft/jawis/tree/main/packages/" +
      packageName +
      "#readme";

    json.repository = {
      type: "git",
      url: "https://github.com/wistoft/jawis.git",
      directory: "packages/" + packageName,
    };

    if (json.sideEffects) {
      json.sideEffects = json.sideEffects.map((file) =>
        file.replace(/\.ts$/, ".js")
      );

      //they must exist in build folder

      for (const file of json.sideEffects) {
        const absFile = path.join(targetFolder, file);

        if (checkSideEffects) {
          if (!(await fse.pathExists(absFile))) {
            throw new Error(
              "File declared in sideEffect must exist: " +
                file +
                ", package: " +
                packageName +
                ", folder: " +
                targetFolder
            );
          }
        }
      }
    }

    try {
      json.dependencies = sortObject({
        ...siblingDeps[packageName],
        ...json.dependencies,
      });
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
  const addLicenceFiles = () =>
    Promise.all(
      [...scopedPackages, ...unscopedPackages].map((packageName) =>
        fs.promises.copyFile(
          path.join(projectFolder, "LICENCE"),
          path.join(buildFolder, packageName, "LICENCE")
        )
      )
    );

  /**
   *
   */
  const buildPackageJson = async (checkSideEffects = true) => {
    //read sibling deps

    const siblingDeps = await getAllSiblingDeps();

    //process package.json files

    const files = await fastGlob([packagesPattern + "/package.json"], {
      cwd: packageFolder,
    });

    for (const file of files) {
      const packageName = path.basename(file.replace(/\/package\.json$/, ""));

      const targetFolder = path.join(buildFolder, packageName);

      //read

      const jsonStr = await fs.promises.readFile(
        path.join(packageFolder, file)
      );

      const json = JSON.parse(jsonStr);

      //transform

      const result = JSON.stringify(
        await transformPackageJson(
          json,
          packageName,
          targetFolder,
          siblingDeps,
          checkSideEffects
        ),
        undefined,
        2
      );

      //write to build folder

      const target = path.join(buildFolder, file);

      await fse.ensureDir(path.dirname(target));
      await fs.promises.writeFile(target, result + "\n");
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
      try {
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
      } catch (error) {
        console.log("Could not build: " + file);
        console.log(error);
      }
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
    await checkPackages();
    await copyFiles();
    await addLicenceFiles();
    await buildTs();
    await buildPackageJson();
  };

  return {
    projectFolder,
    getFullPackageName,
    getSiblingPackages,
    getAllPackageDeps,
    getAllSiblingDeps,
    checkPackages,
    checkPackagesExistsInCodebase,
    checkPackageHasDeclaration,
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
