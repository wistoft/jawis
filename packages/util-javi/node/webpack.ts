import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { ResolveOptions, RuleSetRule } from "webpack";

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
    }),
  ],
});
