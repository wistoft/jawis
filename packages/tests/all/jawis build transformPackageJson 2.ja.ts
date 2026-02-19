import { TestProvision } from "^jarun";
import { getScriptPath, testTransformPackageJson } from "^tests/_fixture";

//sideEffect files have their ts-extension replaced to js.

export default (prov: TestProvision) =>
  testTransformPackageJson(
    {
      sideEffects: ["hello.js", "silent.ts"],
    },
    "first-library",
    getScriptPath(),
    {}
  );
