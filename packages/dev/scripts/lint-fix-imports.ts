import isBuiltin from "is-builtin-module";
import fs from "fs";
import path, { basename } from "path";

import { err } from "^jab/error";
import { assertNever, setDifference } from "^jab/util";

import { makeLiveJawisBuildManager } from "./build/util2";
import { allPackagesIncludingPrivate, projectRoot } from "../project.conf";
import { emitVsCodeError } from "./build/util";
import { getPackageDependencies } from "./build/util3";
import { tryGetCommonPackage } from "./build/util3";

/**
 *
 */
export const doit = async () => {
  const doFix = true;

  const packageFolder = path.join(projectRoot, "packages");
  const buildManeger = makeLiveJawisBuildManager();
  const packages = allPackagesIncludingPrivate;

  //packages

  for (const packageName of packages) {
    if (packageName === "lazy-require-ts") {
      //regexp has false positive in this package
      continue;
    }

    if (packageName === "jab-node") {
      //has a sub folder
      continue;
    }

    await checkRelativeImportsInPackage(
      path.join(packageFolder, packageName),
      packageName,
      doFix,
      buildManeger
    );
  }
};

/**
 *
 */
const checkRelativeImportsInPackage = async (
  folder: string,
  packageName: string,
  doFix: boolean,
  buildManager: ReturnType<typeof makeLiveJawisBuildManager>
) => {
  const files = await fs.promises.readdir(folder);
  const seenNpmImports = new Set<string>();
  const seenSiblingImports = new Set<string>();
  const useUndectable = new Set([
    "shebang-loader",
    "ts-loader",
    "source-map-loader",
  ]);

  const filtered = files
    .filter(
      (file) =>
        file.endsWith(".js") || file.endsWith(".ts") || file.endsWith(".tsx")
    )
    .filter(
      (file) =>
        file !== "index.js" && file !== "index.ts" && file !== "internal.ts"
    );

  for (const file of filtered) {
    await fixImportsInFile(
      path.join(folder, file),
      seenNpmImports,
      seenSiblingImports,
      doFix
    );
  }

  // ignore missing/unused dependencies in private packages (or auto fix)

  if (
    packageName === "dev" ||
    packageName === "tests" ||
    packageName === "javi-client" ||
    packageName === "misc"
  ) {
    return;
  }

  //check npm dependencies

  const deps = new Set(
    (await getPackageDependencies(buildManager.projectFolder)).filter(
      (dep) =>
        !dep.startsWith("@types/") && //types must be checked another way
        !useUndectable.has(dep)
    )
  );

  // const unused = setDifference(deps, seenNpmImports, useUndectable);
  const missing = setDifference(seenNpmImports, deps);

  if (missing.size > 0) {
    emitVsCodeError({
      file: path.join(folder, "package.json"),
      message: "Missing dependencies: " + Array.from(missing).join(", "),
    });
  }

  // if (unused.size > 0) {
  //   emitVsCodeError({
  //     file: path.join(folder, "package.json"),
  //     message: "Unused dependencies: " + Array.from(unused).join(", "),
  //   });
  // }

  //check sibling dependencies

  if (!buildManager) {
    return;
  }

  const commonPackage = await tryGetCommonPackage(packageName);
  const commonPackageSet = new Set(commonPackage && ["^" + commonPackage]); //no need to report this is unused.

  const siblings = new Set(
    (await buildManager.getSiblingPackages(basename(folder), false, true)).map(
      (sibling) => "^" + sibling
    )
  );

  const unused2 = setDifference(siblings, seenSiblingImports, commonPackageSet);
  const missing2 = setDifference(seenSiblingImports, siblings);

  if (missing2.size > 0) {
    emitVsCodeError({
      file: path.join(folder, "tsconfig.json"),
      message:
        "Missing sibling dependencies: " + Array.from(missing2).join(", "),
    });
  }

  if (unused2.size > 0) {
    emitVsCodeError({
      file: path.join(folder, "tsconfig.json"),
      message: "Unused sibling dependencies: " + Array.from(unused2).join(", "),
    });
  }
};

/**
 *
 */
const fixImportsInFile = async (
  file: string,
  seenNpmImports: Set<string>,
  seenSiblingImports: Set<string>,
  doFix: boolean
) => {
  const code = (await fs.promises.readFile(file)).toString();

  const newCode = replaceImportsInCode(code, (specifier) =>
    transformImport(specifier, seenNpmImports, seenSiblingImports)
  );

  if (code === newCode) {
    //nothing changed, nothing to write
    return;
  }

  if (doFix) {
    await fs.promises.writeFile(file, newCode);
  }
};

/**
 *
 */
const transformImport = (
  specifier: string,
  seenNpmImports: Set<string>,
  seenSiblingImports: Set<string>
) => {
  let cat: ReturnType<typeof categorizeImportSpecifier>;

  try {
    cat = categorizeImportSpecifier(specifier);
  } catch (error) {
    console.log("ignoring import: " + specifier);
    return specifier;
  }

  const rootImportPath = specifierToNpmPackage(specifier);

  switch (cat) {
    case "node-built-in":
      return specifier;

    case "sibling":
      seenSiblingImports.add(rootImportPath);
      return rootImportPath;

    case "npm":
      seenNpmImports.add(rootImportPath);
      return specifier;

    case "relative":
      return "./internal"; //just ignore what ever was there before

    case "relative-external":
      return specifier; //allowed in private packages.

    case "absolute":
      throw new Error("absolute import isn't allows");

    default:
      return assertNever(cat);
  }
};

/**
 *
 */
const specifierToNpmPackage = (specifier: string) => {
  if (specifier.startsWith("@")) {
    return specifier.replace(/(^@[^/]+\/[^/]+).*$/, "$1");
  } else {
    return specifier.replace(/(^[^/]+).*$/, "$1");
  }
};

/**
 *
 */
const replaceImportsInCode = (
  code: string,
  transformImport: (specifier: string) => string
) =>
  code
    //transform dynamic import
    .replace(new RegExp('(?<=import\\(")[^"]*', "g"), transformImport)
    //transform static require
    .replace(new RegExp('(?<=require\\(")[^"]*', "g"), transformImport)
    //transform static import
    .replace(new RegExp('(?<= from ")[^"]*', "g"), transformImport);

/**
 *
 * todo
 *  - check it handles: 'node:fs'
 */
export const categorizeImportSpecifier = (specifier: string) => {
  //todo: get the import mapping specific to the repo.
  if (specifier.startsWith("^")) {
    return "sibling";
  }

  if (/^\.\./.test(specifier)) {
    return "relative-external";
  }

  if (/^\./.test(specifier)) {
    return "relative";
  }

  if (/^(\/|\w:)/.test(specifier)) {
    return "absolute";
  }

  if (isBuiltin(specifier)) {
    return "node-built-in";
  }

  //unscoped npm package
  if (/^[a-z0-9\-_]/i.test(specifier)) {
    return "npm";
  }

  //scoped npm package
  if (specifier.startsWith("@")) {
    return "npm";
  }

  throw err("categorizeImportSpecifier: unknown import: " + specifier);
};

doit();
