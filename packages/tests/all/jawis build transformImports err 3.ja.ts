import { TestProvision } from "^jarun";
import { makeTestJawisBuildManager } from "^tests/_fixture";

// malformed

export default (prov: TestProvision) => {
  makeTestJawisBuildManager().transformImports(
    "filename.d.ts",
    'export * from "^/javic";'
  );
};
