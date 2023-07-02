import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { projectRoot, packageFolder } from "^dev/project.conf";
import { topologicalSortObject } from "^assorted-algorithms";
import { getNpmLatestInfo } from "../util/util-npm";

import { makeLiveJawisBuildManager } from "^dev/scripts/build/util2";

/**
 *
 */
export const getLiveBuildVersionInfo = async () => {
  const allowPrivate = false;

  const builder = makeLiveJawisBuildManager();

  const tmp = await builder.getAllPackageDeps(false, allowPrivate);

  let sorted = topologicalSortObject(tmp as any) as string[];

  //download versions

  const decorated = await Promise.all(
    sorted.map(async (packageName) => {
      const fullPackageName = builder.getFullPackageName(packageName) as string;
      return {
        packageName,
        fullPackageName,
        latestVersion: (await getNpmLatestInfo(fullPackageName, false))
          ?.version as string,
        repoVersion: await getRepoVersion(packageName),
      };
    })
  );

  //partition

  const torelease: string[] = [];
  const toignore: string[] = [];

  for (const { packageName, latestVersion, repoVersion } of decorated) {
    if (latestVersion !== repoVersion) {
      torelease.push(packageName);
    } else {
      toignore.push(packageName);
    }
  }

  //return

  return { torelease, toignore };
};

/**
 *
 */
export const getRepoVersion = async (packageName: string) => {
  const jsonStr = await fs.promises.readFile(
    path.join(packageFolder, packageName, "package.json")
  );

  const jso = JSON.parse(jsonStr.toString());

  return jso.version as string;
};

/**
 * hacky
 */
export const tryGetCommonPackage = async (packageName: string) => {
  const folder = path.join(projectRoot, "packages", packageName);

  if (await fse.pathExists(folder + "c")) {
    return packageName + "c";
  }

  if (!packageName.endsWith("c")) {
    if (await fse.pathExists(folder.slice(0, -1) + "c")) {
      return packageName.slice(0, -1) + "c";
    }
  }
};

/**
 *
 */
export const getPackageVersion = async (
  packageFolder: string,
  packageName: string
) => {
  const jsonStr = await fs.promises.readFile(
    path.join(packageFolder, packageName, "package.json")
  );

  const jso = JSON.parse(jsonStr.toString());

  return jso.version as string;
};

/**
 *
 */
export const getSideEffectsDeclaration = async (json: any) => {
  if (json.sideEffects === false) {
    return;
  }

  return json.sideEffects as string[] | undefined;
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
