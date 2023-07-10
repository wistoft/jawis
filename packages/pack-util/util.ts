import webpack, { ResolveOptions, RuleSetRule } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

import { makeJabError } from "^jab";
import { getPromise } from "^yapu";

/**
 *
 */
export const webpackCompile = (conf: webpack.Configuration) => {
  const prom = getPromise<webpack.Stats | undefined>();

  webpack(conf, (err, stats) => {
    if (err) {
      prom.reject(err);
    } else if (stats && (stats.hasErrors() || stats.hasWarnings())) {
      prom.reject(makeJabError("Webpack errors: ", "" + stats));
    } else {
      prom.resolve(stats);
    }
  });

  return prom.promise;
};

/**
 *
 */
export const getWebpackTSRules = (tsConfigFile: string): RuleSetRule[] => [
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
];

/**
 *
 */
export const getWebpackResolve = (tsConfigFile: string): ResolveOptions => ({
  extensions: [".ts", ".tsx", ".js"],
  plugins: [
    new TsconfigPathsPlugin({
      configFile: tsConfigFile,
    }) as any,
  ],
});
