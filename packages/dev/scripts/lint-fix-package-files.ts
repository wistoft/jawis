import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import { AbsoluteFile, emitVsCodeError } from "^jab";
import { BeeMain } from "^bee-common/types";
import {
  allPackagesIncludingPrivate,
  packagesPatternIncludingPrivate,
  projectRoot,
} from "../project.conf";
import { sortObject } from "./build";
import { getSideEffectsDeclaration, tryGetCommonPackage } from "./build";
import { makeAbsolute } from "^jab-node";

/**
 *
 */
export const main: BeeMain = async () => {
  const fixPackageJson = makeFixPackageJson();

  //root package.json

  await fixPackageJson(makeAbsolute(projectRoot, "package.json"));

  //packages

  for (const packageName of allPackagesIncludingPrivate) {
    await fixPackageJson(
      makeAbsolute(
        projectRoot,
        path.join("packages", packageName, "package.json")
      )
    );

    await fixIndexFile(path.join(projectRoot, "packages", packageName));

    await fixInternalFile(
      path.join(projectRoot, "packages", packageName),
      packageName
    );
  }
};

/**
 *
 * - Avoids to write identical files, because dev tools will be triggered and do a lot of unneeded work.
 */
const fixIndexFile = async (folder: string) => {
  const file = path.join(folder, "index.ts");

  if (!(await fse.pathExists(file))) {
    return;
  }

  const content = (await fs.promises.readFile(file)).toString(); // prettier-ignore

  const filtered = content
    .split("\n")
    .filter((file) => file.match(/^\s*$/) === null);

  const result = filtered.sort((a, b) => a.localeCompare(b)).join("\n") + "\n";

  await fs.promises.writeFile(file, result);
};

/**
 *
 * - Avoids to write identical files, because dev tools will be triggered and do a lot of unneeded work.
 */
const makeFixPackageJson = () => {
  const versions = new Map<string, string>();

  return async (file: AbsoluteFile) => {
    const jsonStr = (await fs.promises.readFile(file)).toString();

    const json = JSON.parse(jsonStr);

    if (json.dependencies) {
      //sort
      json.dependencies = sortObject(json.dependencies);

      const newJsonStr = JSON.stringify(json, null, 2) + "\n";

      if (jsonStr !== newJsonStr) {
        await fs.promises.writeFile(file, newJsonStr);
      }

      //check versions
      for (const [dep, version] of Object.entries<string>(json.dependencies)) {
        const stored = versions.get(dep);
        if (stored !== undefined && stored !== "error-seen") {
          if (version !== stored) {
            emitVsCodeError({
              file,
              message: "Version is not consistent across all packages: " + dep,
            });
            versions.set(dep, "error-seen");
          }
        } else {
          versions.set(dep, version);
        }
      }
    }
  };
};

/**
 *
 */
export const fixInternalFile = async (folder: string, packageName: string) => {
  const packageJson = JSON.parse((await fs.promises.readFile(path.join(folder, "package.json"))).toString()); // prettier-ignore

  let sideEffects = await getSideEffectsDeclaration(packageJson);

  sideEffects = sideEffects?.map((file) => file.replace(/^\.\//, ""));

  const files = await fs.promises.readdir(folder);

  const filteredAndSorted = files
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter(
      (file) =>
        file !== "index.ts" &&
        file !== "internal.ts" &&
        !file.endsWith(".d.ts") &&
        !file.endsWith("Main.ts") && //quick fix - because only one of these can be included in index files.
        !sideEffects?.includes(file)
    )
    .map((file) => file.replace(/\.tsx?$/, ""))
    .sort((a, b) => a.localeCompare(b));

  if (filteredAndSorted.length <= 1) {
    //no need for a internal files
    return;
  }

  let internalFile = filteredAndSorted.reduce<string>(
    (acc, file) => acc + 'export * from "./' + file + '";\n',
    ""
  );

  //add common package if it exists

  const commonPackage = await tryGetCommonPackage(packageName);

  if (commonPackage) {
    internalFile += '\nexport * from "^' + commonPackage + '";\n';
  }

  //write

  const targetFile = path.join(folder, "internal.ts");

  if (await fse.pathExists(targetFile)) {
    if (internalFile === (await fs.promises.readFile(targetFile)).toString()) {
      return;
    }
  }

  await fs.promises.writeFile(targetFile, internalFile);
};
