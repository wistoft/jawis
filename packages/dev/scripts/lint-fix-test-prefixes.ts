import fs from "node:fs";
import path from "node:path";
import { basename } from "node:path";
import {
  privatePackages,
  scopedPackages,
  unscopedPackages,
  projectRoot,
  phpPackages,
} from "../project.conf";
import { BeeMain } from "^bee-common/types";
import { listFoldersNonRecursive } from "^jab-node";

/**
 *
 */
export const main: BeeMain = async () => {
  const tests = (
    await fs.promises.readdir(path.join(projectRoot, "/packages/tests/all"))
  ).sort((a, b) => a.localeCompare(b));

  const miscPackages = (
    await listFoldersNonRecursive(path.join(projectRoot, "/packages/misc"))
  ).map((folder) => basename(folder));

  const allowedPrefixes = [
    "self",
    "hello",
    "jawis build",
    "shared", //quick fix
    ...miscPackages,
    ...scopedPackages,
    ...unscopedPackages,
    ...privatePackages,
    ...phpPackages,
  ];

  for (const test of tests) {
    const allowed = allowedPrefixes.some((prefix) =>
      test.startsWith(prefix + " ")
    );

    allowed || console.log(test);
  }
};
