import { TestProvision } from "^jarun";
import { getProjectPath } from "^tests/_fixture";

//works if gulpfile is declared correctly

export default (prov: TestProvision) => {
  const gulp = require(getProjectPath("gulpfile.js"));

  gulp.checkPackageDestinations(() => {});
};
