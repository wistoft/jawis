import path from "path";
import fs from "fs";
import os from "os";
import prettier from "prettier";

import { getNodeWebpackConf, webpackCompile } from "^pack-util";

/**
 *
 */
export const webpack_test = (file: string) => {
  const outPath = path.join(os.tmpdir(), "testCases");

  const conf = getNodeWebpackConf({
    file,
    outPath,
    runtimeChunk: true,
  });

  return webpackCompile(conf).then(() => {
    const code = fs
      .readFileSync(path.join(outPath, "main.js"))
      .toString()
      .replace(/\/\*\*\*\//g, "");

    return prettier.format(code, { parser: "babel" });
  });
};
