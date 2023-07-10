import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

import { getAbsConfigFilePath } from "^ts-config-util";

import {
  getWebpackResolve,
  makeNodeExternals,
  getWebpackTSRules,
} from "./internal";

export type WebpackConf = {
  file: string;
  outPath: string;
  outFilename?: string;
  tsConfigFile?: string;
  runtimeChunk?: boolean;
  comments?: boolean;
  beautify?: boolean;
  mangle?: boolean;
};

/**
 * Meant for compiling node programs.
 *
 * - Primary feature tree-shaking. Minification isn't that important.
 * - to get tree-shaking, typescript target=ES6 is needed.
 * - one can save more bytes, by mangle=true, and beautify=false, but then source mapping is unavoidable.
 *
 */
export const getNodeWebpackConf = ({
  file,
  outPath,
  outFilename,
  tsConfigFile,
  runtimeChunk = false,
  comments = true,
  beautify = true,
  mangle = false,
}: WebpackConf): webpack.Configuration => {
  if (!tsConfigFile) {
    tsConfigFile = getAbsConfigFilePath(path.dirname(file));
  }

  return {
    mode: "production",

    entry: file,

    resolve: getWebpackResolve(tsConfigFile),

    target: "node",

    externals: [makeNodeExternals()],

    module: {
      rules: getWebpackTSRules(tsConfigFile),
    },

    output: {
      path: outPath,
      filename: outFilename,
    },

    optimization: {
      runtimeChunk,
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              beautify,
              comments,
            },
            module: true,
            compress: true,
            mangle,
            keep_classnames: true,
            keep_fnames: true,
          },
        }) as any,
      ],
    },
  };
};
