import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack, { RuleSetRule } from "webpack";

import { getPromise, JabError } from "^jab";
import { getAbsConfigFilePath } from "^jacs";
import { makeNodeExternals } from "^misc";
import { getWebpackResolve, getWebpackTSRules } from "^util-javi/node/webpack";

export type NewWebpackConf = {
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
};

/**
 *
 */
export const webpackCompile = (conf: webpack.Configuration) => {
  const prom = getPromise<webpack.Stats | undefined>();

  webpack(conf, (err, stats) => {
    if (err) {
      prom.reject(err);
    } else if (stats && (stats.hasErrors() || stats.hasWarnings())) {
      prom.reject(new JabError("Webpack errors:\n", "" + stats));
    } else {
      prom.resolve(stats);
    }
  });

  return prom.promise;
};

/**
 * Meant for compiling node programs.
 *
 */
export const getNodepackConf = (conf: NewWebpackConf): webpack.Configuration =>
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
}: NewWebpackConf): webpack.Configuration => {
  if (!tsConfigFile) {
    tsConfigFile = getAbsConfigFilePath(path.dirname(file));
  }

  return {
    mode: "production",

    entry: file,

    resolve: getWebpackResolve(tsConfigFile),

    target,

    externals,

    module: {
      rules: [...loaders, ...getWebpackTSRules(tsConfigFile)],
    },

    output: {
      path: outPath,
      filename: outFilename,
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
