import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

// malformed

export default (prov: TestProvision) => {
  makeTestJawisBuildManager().transformImports(
    "filename.js",
    'require("^/first-library");'
  );
};
