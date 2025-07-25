import path from "node:path";
import TerserPlugin from "terser-webpack-plugin";
import webpack, { RuleSetRule } from "webpack";
import ts from "typescript";

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
  devtool?: string | false;
  target?: string;
  externals?: webpack.Configuration["externals"];
  loaders?: RuleSetRule[];
  compilerOptions?: any;
  library?: any;
};

/**
 * Meant for compiling node programs.
 *
 */
export const getNodepackConf = (conf: WebpackConf): webpack.Configuration =>
  getWebpackConf({
    ...conf,
    target: "node",
    externals: conf.externals ? conf.externals : makeNodeExternals(),
    loaders: [
      {
        enforce: "pre",
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        loader: "shebang-loader",
      },
    ],
    compilerOptions: { module: "node16", moduleResolution: "node16" },
    library: {
      type: "commonjs2",
    },
  });

/**
 * Convenient webpack configuration
 *
 * - Primary feature tree-shaking. Minification is less important.
 * - to get tree-shaking, typescript target=ES6 is needed.
 * - one can save more bytes, by mangle=true, and beautify=false, but then source mapping is unavoidable.
 *
 */
export const getWebpackConf = ({
  file,
  outPath,
  outFilename,
  tsConfigFile,
  runtimeChunk = false,
  comments = true,
  beautify = true,
  mangle = false,
  devtool = "source-map",
  target = undefined,
  externals = undefined,
  loaders = [],
  compilerOptions = {
    module: "esnext",
    //is this needed in typescript 5
    moduleResolution: "classic",
  },
  library = undefined,
}: WebpackConf): webpack.Configuration => {
  if (!tsConfigFile) {
    tsConfigFile = getAbsConfigFilePath(ts, path.dirname(file));
  }

  return {
    mode: "production",

    entry: file,

    resolve: getWebpackResolve(tsConfigFile),

    target,

    externals,

    module: {
      rules: [...loaders, ...getWebpackTSRules(tsConfigFile, compilerOptions)],
    },

    plugins: [],

    output: {
      path: outPath,
      filename: outFilename,
      library,
    },

    devtool,

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
