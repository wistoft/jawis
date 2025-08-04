import isBuiltin from "is-builtin-module";
import fs from "node:fs";
import path, { basename } from "node:path";

import { BeeMain } from "^bee-common/types";
import { emitVsCodeError, err } from "^jab/error";
import { assertNever, setDifference } from "^jab/util";
import { categorizeImportSpecifier, replaceImportsInCode } from "^pack-util";
import { makeAbsolute } from "^jab-node";

import {
  makeLiveJawisBuildManager,
  getPackageDependencies,
  tryGetCommonPackage,
} from "./index";

/**
 * todo: duplicated in build-functions
 */
export const checkRelativeImportsInPackage = async (
  folder: string,
  packageName: string,
  doFix: boolean,
  buildManager?: ReturnType<typeof makeLiveJawisBuildManager>
) => {
  const files = await fs.promises.readdir(folder);
  const seenNpmImports = new Set<string>();
  const seenSiblingImports = new Set<string>();
  const useUndetectable = new Set([
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
      packageName,
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
    (await getPackageDependencies(folder)).filter(
      (dep) =>
        !dep.startsWith("@types/") && //types must be checked another way
        !useUndetectable.has(dep)
    )
  );

  // const unused = setDifference(deps, seenNpmImports, useUndectable);
  // const missing = setDifference(seenNpmImports, deps);

  // if (missing.size > 0) {
  //   emitVsCodeError({
  //     file: path.join(folder, "package.json"),
  //     message: "Missing dependencies: " + Array.from(missing).join(", "),
  //   });
  // }

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
      file: makeAbsolute(folder, "tsconfig.json"),
      message:
        "Missing sibling dependencies: " + Array.from(missing2).join(", "),
    });
  }

  if (unused2.size > 0) {
    emitVsCodeError({
      file: makeAbsolute(folder, "tsconfig.json"),
      message: "Unused sibling dependencies: " + Array.from(unused2).join(", "),
    });
  }
};

/**
 *
 */
export const fixImportsInFile = async (
  file: string,
  packageName: string,
  seenNpmImports: Set<string>,
  seenSiblingImports: Set<string>,
  doFix: boolean
) => {
  const code = (await fs.promises.readFile(file)).toString();

  const newCode = replaceImportsInCode(code, (specifier) =>
    transformImport(
      specifier,
      file,
      packageName,
      seenNpmImports,
      seenSiblingImports
    )
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
export const transformImport = (
  specifier: string,
  file: string,
  packageName: string,
  seenNpmImports: Set<string>,
  seenSiblingImports: Set<string>
) => {
  if (specifier === "^" + packageName) {
    //the package references itself.
    return "./internal";
  }

  let cat: ReturnType<typeof categorizeImportSpecifier>;

  try {
    cat = categorizeImportSpecifier(specifier);
  } catch (error) {
    console.log("ignoring import", { specifier, file });
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
      throw new Error("absolute import isn't allowed");

    default:
      return assertNever(cat);
  }
};

/**
 * Removes the filepath of the specifier, and only returns the pure package.
 */
export const specifierToNpmPackage = (specifier: string) => {
  if (specifier.startsWith("@")) {
    return specifier.replace(/(^@[^/]+\/[^/]+).*$/, "$1");
  } else {
    return specifier.replace(/(^[^/]+).*$/, "$1");
  }
};
