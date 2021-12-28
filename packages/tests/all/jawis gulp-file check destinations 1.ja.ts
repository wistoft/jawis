import { TestProvision } from "^jarun";
import { getProjectPath } from "^tests/_fixture";

//it exists, so it doesn't throw.

export default (prov: TestProvision) => {
  const gulp = require(getProjectPath("gulpfile.js"));

  gulp.checkPackagesExistsInCodebase(["jab-node"]);
};
