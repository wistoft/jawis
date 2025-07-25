import path from "node:path";
import fs from "node:fs";
import prettier from "prettier";
import webpack from "webpack";

import { getNodepackConf, getWebpackConf, webpackCompile } from "^pack-util";
import { getTmpFolder } from ".";

/**
 *
 */
export const nodepack_test = (file: string) => {
  const outPath = getTmpFolder("webpack-tests");

  return webpack_in_memory(
    outPath,
    getNodepackConf({
      file,
      outPath,
      devtool: false,
    })
  );
};

/**
 *
 */
export const webpack_test = (file: string) => {
  const outPath = getTmpFolder("webpack-tests");

  return webpack_in_memory(
    outPath,
    getWebpackConf({
      file,
      outPath,
      devtool: false,
    })
  );
};

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
