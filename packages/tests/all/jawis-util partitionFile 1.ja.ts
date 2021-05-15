import { TestProvision } from "^jarun";

import { partitionFile } from "^util/web";

export default ({ eq }: TestProvision) => {
  //no folder

  eq(
    { firstDir: "", filepath: "", filename: "file.js" },
    partitionFile("file.js")
  );

  eq(
    { firstDir: "", filepath: "/", filename: "file.js" },
    partitionFile("/file.js")
  );

  eq(
    { firstDir: "", filepath: "e:/", filename: "file.js" },
    partitionFile("e:/file.js")
  );

  //one folder

  eq(
    { firstDir: "package", filepath: "/", filename: "file.js" },
    partitionFile("package/file.js")
  );

  eq(
    { firstDir: "", filepath: "/package/", filename: "file.js" },
    partitionFile("/package/file.js")
  );

  eq(
    { firstDir: "", filepath: "e:/package/", filename: "file.js" },
    partitionFile("e:/package/file.js")
  );

  //two folders.

  eq(
    { firstDir: "dir1", filepath: "/dir2/", filename: "file.js" },
    partitionFile("dir1/dir2/file.js")
  );

  eq(
    { firstDir: "", filepath: "/dir1/dir2/", filename: "file.js" },
    partitionFile("/dir1/dir2/file.js")
  );

  eq(
    { firstDir: "", filepath: "e:/dir1/dir2/", filename: "file.js" },
    partitionFile("e:/dir1/dir2/file.js")
  );
};
