import isBuiltin from "is-builtin-module";
import fs from "fs";
import path from "path";

import { err } from "^jab/error";
import { assertNever } from "^jab/util";

import { setDifference } from "./util/util";
import { allPackagesIncludingPrivate, projectRoot } from "../project.conf";

/**
 *
 */
export const doit = async () => {
  //packages

  for (const packageName of allPackagesIncludingPrivate) {
    if (packageName === "lazy-require-ts") {
      //regexp has false positive in this package
      continue;
    }

    if (packageName === "jab-node" || packageName === "jab-react") {
      //has a sub folder
      continue;
    }

    try {
      await checkRelativeImportsInPackage(
        path.join(projectRoot, "packages", packageName),
        packageName
      );
    } catch (error) {
      console.log(packageName);
      console.log(error);
    }

    // break;
  }
};

/**
 *
 */
const checkRelativeImportsInPackage = async (
  folder: string,
  packageName: string
) => {
  const files = await fs.promises.readdir(folder);
  const seenNpmImports = new Set<string>();
  const seenSiblingImports = new Set<string>();
  const useUndectable = new Set([
    "shebang-loader",
    "ts-loader",
    "source-map-loader",
  ]);

  const filteredAndSorted = files
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter((file) => file !== "index.ts" && file !== "internal.ts");

  for (const file of filteredAndSorted) {
    await fixImportsInFile(
      path.join(folder, file),
      seenNpmImports,
      seenSiblingImports
    );
    // break;
  }

  //check npm dependencies

  if (
    packageName === "dev" ||
    packageName === "tests" ||
    packageName === "misc"
  ) {
    return;
  }

  const deps = new Set(
    (await getPackageDependencies(folder)).filter(
      (dep) =>
        !dep.startsWith("@types/") && //types must be checked another way
        !useUndectable.has(dep)
    )
  );

  const unused = setDifference(deps, seenNpmImports, useUndectable);
  const missing = setDifference(seenNpmImports, deps);

  if (unused.size > 0 || missing.size > 0) {
    console.log({ folder, unused, missing });
  }
};

/**
 *
 */
const fixImportsInFile = async (
  file: string,
  seenNpmImports: Set<string>,
  seenSiblingImports: Set<string>
) => {
  const code = (await fs.promises.readFile(file)).toString();

  const newCode = replaceImportsInCode(code, (specifier) =>
    transformImport(specifier, seenNpmImports, seenSiblingImports)
  );

  if (code === newCode) {
    //nothing changed, nothing to write
    return;
  }

  await fs.promises.writeFile(file, newCode);
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

/**
 *
 */
export const getPackageDependencies = async (folder: string) => {
  const jsonStr = (
    await fs.promises.readFile(path.join(folder, "package.json"))
  ).toString();

  const json = JSON.parse(jsonStr);

  let deps: string[] = [];

  if (json.dependencies) {
    deps = deps.concat(Object.keys(json.dependencies));
  }

  if (json.peerDependencies) {
    deps = deps.concat(Object.keys(json.peerDependencies));
  }

  return deps;
};

doit();
