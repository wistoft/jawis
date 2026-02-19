import { TestProvision } from "^jarun";
import { getScriptPath, testTransformPackageJson } from "^tests/_fixture";

//sideEffect doesn't exist.

export default (prov: TestProvision) =>
  testTransformPackageJson(
    {
      sideEffects: ["dontExist.js"],
    },
    "first-library",
    getScriptPath(),
    {}
  ).catch((error) => {
    prov.chk(
      error.toString().includes("File declared in sideEffect must exist")
    );
  });
