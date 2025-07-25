import path, { basename } from "node:path";

import { BeeMain } from "^bee-common/types";

import {
  checkRelativeImportsInPackage,
  makeLiveJawisBuildManager,
} from "./build";
import { allPackagesIncludingPrivate, packageFolder } from "../project.conf";

/**
 *
 */
export const main: BeeMain = async () => {
  const doFix = true;

  for (const packageName of allPackagesIncludingPrivate) {
    await checkRelativeImportsInPackage(
      path.join(packageFolder, packageName),
      packageName,
      doFix,
      makeLiveJawisBuildManager()
    );
  }
};
