import { TestProvision } from "^jarun";
import {
  filterAbsoluteFilesInStdout,
  makeTestJawisBuildManager,
} from "^tests/_fixture";

export default (prov: TestProvision) => {
  filterAbsoluteFilesInStdout(prov);

  return makeTestJawisBuildManager().checkPackageJsonFile("first-library");
};
