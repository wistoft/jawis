import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

import { getPromise, JabError } from "^jab";
import { getAbsConfigFilePath } from "^jacs";
import { nodeExternals } from "^misc";

/**
 *
 */
export const webpackCompile = (conf: webpack.Configuration) => {
  const prom = getPromise<webpack.Stats | undefined>();

  webpack(conf, (err, stats) => {
    if (err) {
      prom.reject(err);
    } else if (stats && (stats.hasErrors() || stats.hasWarnings())) {
      prom.reject(new JabError("Webpack errors: ", "" + stats));
    } else {
      prom.resolve(stats);
    }
  });

  return prom.promise;
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
}: {
  file: string;
  outPath: string;
  outFilename?: string;
  tsConfigFile?: string;
  runtimeChunk?: boolean;
  comments?: boolean;
  beautify?: boolean;
  mangle?: boolean;
}): webpack.Configuration => {
  if (!tsConfigFile) {
    tsConfigFile = getAbsConfigFilePath(path.dirname(file));
  }

  return {
    mode: "production",

    entry: file,

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigFile,
        }) as any,
      ],
    },

    target: "node",

    externals: [nodeExternals],

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                configFile: tsConfigFile,
                compilerOptions: {
                  module: "esnext",
                  sourceMap: true,
                },
              },
            },
          ],
        },
        // All output '.js' files will have sourcemaps re-processed, to enforce consistency.
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "source-map-loader",
        },
      ],
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
