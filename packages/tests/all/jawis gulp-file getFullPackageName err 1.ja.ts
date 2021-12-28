import { TestProvision } from "^jarun";
import { getProjectPath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const gulp = require(getProjectPath("gulpfile.js"));

  console.log(gulp.getFullPackageName("dontExist"));
};
