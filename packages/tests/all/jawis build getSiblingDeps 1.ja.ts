import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

export default async (prov: TestProvision) => {
  prov.imp(
    await makeTestJawisBuildManager().getSiblingPackages("first-library")
  );
  prov.imp(
    await makeTestJawisBuildManager().getSiblingPackages("second-library")
  );
};
