import path from "path";
import fse from "fs-extra";
import { projectRoot } from "^dev/project.conf";

/**
 *
 */
export const difference = (a: string[], b: string[]) => {
  const set = new Set(b);
  return a.filter((x) => !set.has(x));
};

/**
 *
 */
export const setDifference = (a: Set<string>, ...bs: Set<string>[]) => {
  const res = new Set<string>();

  a.forEach((elm) => {
    for (const b of bs) {
      if (b.has(elm)) {
        return;
      }
    }

    res.add(elm);
  });

  return res;
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
