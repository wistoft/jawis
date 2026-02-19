import path from "path";
import { copyFilesBetweenFoldersSync, listFilesRecursiveSync } from "^jab-node";
import { AbsoluteFile } from "^jabc";
import { TestProvision } from "^jarun";
import fastGlob from "fast-glob";
import {
  emptyScratchFolder,
  getMonorepoProjectPath,
  getScratchPath,
  logFolder,
  makeTestJawisBuildManager,
} from "^tests/_fixture";

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  await makeTestJawisBuildManager().copyFiles();

  logFolder(prov, getScratchPath());
};
