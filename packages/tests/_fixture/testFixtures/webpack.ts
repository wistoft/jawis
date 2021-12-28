import path from "path";
import fs from "fs";
import os from "os";
import prettier from "prettier";
import webpack from "webpack";

import { getNodepackConf, getWebpackConf, webpackCompile } from "^misc/node";

const quickFixOutPath = path.join(os.tmpdir(), "testCases");

/**
 *
 */
export const nodepack_test = (file: string) =>
  webpack_in_memory(
    quickFixOutPath,
    getNodepackConf({
      file,
      outPath: quickFixOutPath,
      devtool: false,
    })
  );

/**
 *
 */
export const webpack_test = (file: string) =>
  webpack_in_memory(
    quickFixOutPath,
    getWebpackConf({
      file,
      outPath: quickFixOutPath,
      devtool: false,
    })
  );

/**
 *
 */
export const webpack_in_memory = (
  outPath: string,
  conf: webpack.Configuration
) =>
  webpackCompile(conf).then(() => {
    const code = fs
      .readFileSync(path.join(outPath, "main.js"))
      .toString()
      .replace(/\/\*\*\*\//g, "");

    return prettier.format(code, { parser: "babel" });
  });
