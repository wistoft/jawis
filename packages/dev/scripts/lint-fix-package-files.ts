import fs from "fs";
import fse from "fs-extra";
import path from "path";

import { sortObject } from "./build/util";
import { allPackagesIncludingPrivate, projectRoot } from "../project.conf";

/**
 *
 */
export const doit = async () => {
  const fixPackageJson = makeFixPackageJson();

  //root package.json

  await fixPackageJson(path.join(projectRoot, "package.json"));

  //in packages

  for (const packageName of allPackagesIncludingPrivate) {
    await fixPackageJson(
      path.join(projectRoot, "packages", packageName, "package.json")
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

  return async (file: string) => {
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
            console.log("Version is not consistent across all packages: " + dep); // prettier-ignore
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
 * todo: avoid writing unchanged files.
 */
export const getSideEffectsDeclaration = async (folder: string) => {
  const jsonStr = (
    await fs.promises.readFile(path.join(folder, "package.json"))
  ).toString();

  const json = JSON.parse(jsonStr);

  if (json.sideEffects === false) {
    return;
  }

  return json.sideEffects as string[] | undefined;
};

/**
 * todo: avoid writing unchanged files.
 */
export const fixInternalFile = async (folder: string, packageName: string) => {
  let sideEffects = await getSideEffectsDeclaration(folder);

  sideEffects = sideEffects?.map((file) => file.replace(/^\.\//, ""));

  const files = await fs.promises.readdir(folder);

  const filteredAndSorted = files
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter(
      (file) =>
        file !== "index.ts" &&
        file !== "internal.ts" &&
        !file.endsWith(".d.ts") &&
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

  //hacky

  let commonPackage: string | undefined;

  if (await fse.pathExists(folder + "c")) {
    commonPackage = packageName + "c";
  }

  if (!folder.endsWith("c")) {
    if (await fse.pathExists(folder.slice(0, -1) + "c")) {
      commonPackage = packageName.slice(0, -1) + "c";
    }
  }

  if (commonPackage) {
    internalFile += '\nexport * from "^' + commonPackage + '";\n';
  }

  //write

  await fs.promises.writeFile(path.join(folder, "internal.ts"), internalFile);
};

doit();
