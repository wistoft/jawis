import { TestProvision } from "^jarun";

import { getAbsFile } from "^util/web";

export default ({ eq }: TestProvision) => {
  eq(
    "/serverRoot/package/file.js",
    getAbsFile("/serverRoot", "webpack:///./package/file.js")
  );

  eq(
    "/serverRoot/package/file.js",
    getAbsFile("/serverRoot", "webpack-internal:///./package/file.js")
  );

  eq(
    "/serverRoot/package/file.js",
    getAbsFile("/serverRoot", "/serverRoot/package/file.js")
  );
};
