import { TestProvision } from "^jarun";
import {
  getScratchPath,
  logFolder,
  makeTestJawisBuildManager,
} from "^tests/_fixture";

export default async (prov: TestProvision) => {
  await makeTestJawisBuildManager().buildPackageJson(false);

  logFolder(prov, getScratchPath());
};
