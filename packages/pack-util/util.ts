import webpack, { ResolveOptions, RuleSetRule } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

import {
  assert,
  ErrorData,
  hasProp,
  makeJabError,
  OnError,
  OnErrorData,
} from "^jab";
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
      prom.reject(makeJabError("Webpack errors:\n", "" + stats));
    } else {
      prom.resolve(stats);
    }
  });

  return prom.promise;
};

/**
 *
 */
export const getWebpackTSRules = (
  tsConfigFile: string,
  compilerOptions: any
): RuleSetRule[] => [
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
            sourceMap: true,
            ...compilerOptions,
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

/**
 *
 */
export const extendOnError =
  (onError: OnError, onErrorData: OnErrorData) =>
  (error: any, extraInfo: Array<unknown> = []) => {
    if (hasProp(error, "getAggregateErrors")) {
      assert(extraInfo.length === 0);

      error.getAggregateErrors().map((data: ErrorData) => onErrorData(data));
    } else {
      onError(error, extraInfo);
    }
  };

const reg1 = new RegExp('(?<=import\\(")[^"]+(?="\\))', "g"); // dynamic import
const reg2 = new RegExp('(?<=require\\(")[^"]+(?="\\))', "g"); // static require
const reg3 = new RegExp('(?<= from\\s")[^"]*', "g"); // static import

/**
 *
 * - Dynamic import must have just one literal string to be processed.
 */
export const replaceImportsInCode = (
  code: string,
  transformImport: (specifier: string) => string
) =>
  code
    .replace(reg1, transformImport)
    .replace(reg2, transformImport)
    .replace(reg3, transformImport);

/**
 *
 */
export const getImportsInCode = (code: string) => {
  let res: string[] = [];

  for (const reg of [reg1, reg2, reg3]) {
    res = res.concat(code.match(reg) ?? []);
  }

  return res;
};
