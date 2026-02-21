import { TestProvision } from "^jarun";
import {
  emptyScratchFolder,
  getScratchPath,
  logFolder,
  makeTestJawisBuildManager,
} from "^tests/_fixture";

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  await makeTestJawisBuildManager().copyFiles();

  logFolder(prov, getScratchPath());
};
