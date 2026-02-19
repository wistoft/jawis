import { TestProvision } from "^jarun";
import {
  getScratchPath,
  logFolder,
  makeTestJawisBuildManager,
} from "^tests/_fixture";

export default async (prov: TestProvision) => {
  await makeTestJawisBuildManager().buildPackageJson("1.2.3-dev", false);

  logFolder(prov, getScratchPath());
};
