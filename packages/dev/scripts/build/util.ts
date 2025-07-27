import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";
import copyfiles from "copyfiles";
import { topologicalSortObject } from "^assorted-algorithms";
import { getNpmLatestInfo } from "../util/util-npm";

import { makeJawisBuildManager } from "./index";

import {
  projectRoot,
  publishBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
} from "^dev/project.conf";
import { assert } from "^jab";

export const makeLiveJawisBuildManager = () =>
  makeJawisBuildManager(
    projectRoot,
    publishBuildFolder,
    npmScope,
    scopedPackages,
    unscopedPackages,
    privatePackages,
    /* replacePathForRelease */ true,
    phpPackages,
    false
  );

/**
 * Make copyfiles use promise.
 */
export const copyingFiles = (paths: string[], options: any) =>
  new Promise<void>((res, rej) => {
    const callback = (err: any) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    };

    if (options) {
      copyfiles(paths, options, callback);
    } else {
      copyfiles(paths, callback);
    }
  });

/**
 *
 */
export const sortObject = (obj: any) => {
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

  const res: any = {};

  for (const key of keys) {
    res[key] = obj[key];
  }

  return res;
};

/**
 *
 */
export const getLiveBuildVersionInfo = async () => {
  const builder = makeLiveJawisBuildManager();

  const decorated = await getRepoAndLatestNpmVersions(builder);

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
export const getRepoAndLatestNpmVersions = async (builder: any) => {
  const allowPrivate = false;

  const tmp = await builder.getAllPackageDeps(false, allowPrivate);

  let sorted = topologicalSortObject(tmp as any) as string[];

  //download versions

  return Promise.all(
    sorted.map(async (packageName) => {
      const fullPackageName = builder.getFullPackageName(packageName) as string;
      return {
        packageName,
        fullPackageName,
        latestVersion: (await getNpmLatestInfo(fullPackageName, false))
          ?.version as string,
        repoVersion: await getRepoVersion(packageName, builder.projectFolder),
      };
    })
  );
};

/**
 *
 */
export const getRepoVersion = async (
  packageName: string,
  projectFolder: string
) => {
  const jsonStr = await fs.promises.readFile(
    path.join(projectFolder, "packages", packageName, "package.json")
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

  if (await fse.pathExists(folder + "-common")) {
    return packageName + "-common";
  }

  if (!packageName.endsWith("c")) {
    if (await fse.pathExists(folder.slice(0, -1) + "c")) {
      return packageName.slice(0, -1) + "c";
    }
  }

  if (!packageName.endsWith("-common")) {
    if (
      await fse.pathExists(folder.slice(0, folder.lastIndexOf("-")) + "-common")
    ) {
      return packageName.slice(0, packageName.lastIndexOf("-")) + "-common";
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
