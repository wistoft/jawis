import { TestProvision } from "^jarun";

import { getFile } from "^jawis-util/web";

export default ({ eq }: TestProvision) => {
  eq(
    "package/file.js",
    getFile("/serverRoot/", "", "webpack:///./package/file.js")
  );

  eq(
    "package/file.js",
    getFile("/serverRoot/", "", "webpack-internal:///./package/file.js")
  );

  eq(
    "package/file.js",
    getFile("/serverRoot/", "", "/serverRoot/package/file.js")
  );

  // removePathPrefix

  eq(
    "file.js",
    getFile("/serverRoot/", "package/", "webpack:///./package/file.js")
  );

  eq(
    "file.js",
    getFile("/serverRoot/", "package/", "webpack-internal:///./package/file.js")
  );

  eq(
    "file.js",
    getFile("/serverRoot/", "package/", "/serverRoot/package/file.js")
  );

  //don't remove, when just in projectRoot.

  eq(
    "/serverRoot/file.js",
    getFile("/serverRoot/", "package/", "/serverRoot/file.js")
  );
};
