import { TestProvision } from "^jarun";
import { getScriptPath, testTransformPackageJson } from "^tests/_fixture";

export default (prov: TestProvision) =>
  testTransformPackageJson(
    {
      name: "~scoped-library",
      version: "0.0.1",
    },
    "scoped-library",
    getScriptPath(),
    {
      dateformat: "^4.5.1",
    }
  );
